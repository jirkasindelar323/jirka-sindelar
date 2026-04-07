## 3\. SDD — Software Design Document

**(How the System Will Be Designed)**

This document translates the requirements from [BRD.md](BRD.md) and [PRD.md](PRD.md), using the technology decisions from [Technology Decisions.md](Technology%20Decisions.md), into a concrete architectural blueprint for v1 of Jirka Sindelar's personal website. It describes how everything connects — pages, components, content, infrastructure — so that someone (including a future Jirka, or an AI agent) can understand the full system from this document alone.

---

## Introduction & References

| Document                                             | What it answers                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [BRD.md](BRD.md)                                     | Why are we building this? For whom? What does success look like?                            |
| [PRD.md](PRD.md)                                     | What does it do? User stories, functional/non-functional requirements, acceptance criteria. |
| [Technology Decisions.md](Technology%20Decisions.md) | What technologies did we choose and why? Full landscape exploration for each decision.      |
| This document (SDD)                                  | How is it built? Architecture, components, data flow, deployment, security.                 |

**Scope:** This SDD covers v1 only — a static website for humans. v2 (avatar API) and v3 (conversational avatar) are referenced where v1 decisions deliberately leave room for them, but their architecture is not designed here.

---

## System Context

The system is a **static website** that serves content to two types of consumers: human visitors (via browsers) and, passively in v1, AI agents (via structured HTML/JSON-LD).

```
┌─────────────────────────────────────────────────────────┐
│                     VISITORS                            │
│                                                         │
│   Human (browser)          AI Agent (v1: crawl HTML)    │
│   - Mobile phone              - Read structured markup  │
│   - Desktop                   - Parse JSON-LD           │
│   - Tablet                    - Follow semantic HTML     │
└───────────────┬─────────────────────────┬───────────────┘
                │ HTTPS request           │ HTTPS request
                ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│              AWS CLOUDFRONT (CDN)                        │
│   Edge locations worldwide — cached static files        │
│   SSL termination (ACM certificate)                     │
│   Custom domain: jirkasindelar.dev                      │
└───────────────────────┬─────────────────────────────────┘
                        │ Origin request (cache miss only)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              AWS S3 (Origin)                             │
│   Static files: HTML, CSS, JS, images, PDF              │
│   Private bucket — accessible only via CloudFront OAI   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              BUILD & DEPLOY (GitHub)                     │
│                                                         │
│   GitHub repo → GitHub Actions → astro build            │
│   → aws s3 sync → CloudFront invalidation               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                          │
│                                                         │
│   Route 53 — DNS (jirkasindelar.dev → CloudFront)       │
│   ACM — SSL certificate (us-east-1)                     │
│   Analytics — deferred to M3 (Umami or Plausible)       │
└─────────────────────────────────────────────────────────┘
```

**What's NOT in the system (v1):**
- No application server — no Lambda, no API Gateway, no backend.
- No database — content is markdown files built into HTML at build time.
- No authentication — the site is fully public.
- No CMS — content is authored in VS Code and committed to git.

---

## High-Level Architecture

The architecture follows the **Hybrid/Islands** pattern (DP-1): the site is statically generated at build time, with optional interactive "islands" that hydrate independently with JavaScript.

```
┌────────────────────────────────────────────────────────────┐
│                    BUILD TIME (astro build)                 │
│                                                            │
│   src/content/blog/*.md ──┐                                │
│   src/content/projects/*.md ┤   Content Collections        │
│   src/content/config.ts ──┘   (schema + validation)        │
│                                      │                     │
│   src/pages/*.astro ─────────────────┤   Page routing      │
│   src/layouts/*.astro ───────────────┤   (file-based)      │
│   src/components/*.astro ────────────┘                     │
│   src/components/*.tsx ──── React islands (hydrated)       │
│                                                            │
│   Tailwind CSS ──── JIT compile ──── Scoped + utility CSS  │
│                                                            │
│                         ▼                                  │
│              dist/ (static output)                         │
│              ├── index.html                                │
│              ├── blog/index.html                           │
│              ├── blog/my-post/index.html                   │
│              ├── projects/index.html                       │
│              ├── about/index.html                          │
│              ├── _astro/ (JS bundles, CSS)                 │
│              ├── assets/ (images, CV PDF)                  │
│              └── ...                                       │
└────────────────────────────────────────────────────────────┘
```

**Key architectural principle:** Everything is HTML until proven otherwise. Astro generates pure HTML by default. JavaScript is only shipped for components that explicitly opt in via `client:` directives (islands). This means:
- A blog post page = zero JavaScript (just HTML + CSS).
- The landing page with an easter egg game = HTML + CSS + one small JS island for the game.
- Navigation, bio, portfolio, footer = all static HTML.

---

## Technology Stack & Tooling Decisions

| Layer | Choice | Decision |
|---|---|---|
| Rendering strategy | Hybrid / Islands + Edge (future) | DP-1 |
| Framework | Astro (React for islands) | DP-2 |
| Language | TypeScript | DP-3 |
| Content management | Markdown in git (Astro Content Collections) | DP-4 |
| Styling | Tailwind CSS | DP-5 |
| Hosting | AWS S3 + CloudFront (manual v1, SST v2+) | DP-6 |
| Domain | jirkasindelar.dev via Route 53 | DP-7 |
| Analytics | Deferred to M3 (Umami or Plausible) | DP-8 |
| CI/CD | GitHub Actions | DP-9 |
| Source hosting | GitHub | DP-10 |

**Runtime dependencies in production:** None. The production site is static files on a CDN. No runtime, no server, no database.

**Build-time dependencies:**
- Node.js (LTS)
- Astro framework
- Tailwind CSS + @tailwindcss/typography
- TypeScript compiler (via Astro)
- React + ReactDOM (for island components only)

---

## Deployment Architecture

### v1: Manual AWS Setup

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Route 53   │────▶│  CloudFront  │────▶│     S3       │
│              │     │              │     │              │
│ DNS hosted   │     │ Distribution │     │ Private      │
│ zone for     │     │ HTTPS (ACM)  │     │ bucket       │
│ jirkasindelar│     │ Custom domain│     │ HTML/CSS/JS  │
│ .dev         │     │ Cache policy │     │ images, PDF  │
│              │     │ OAI access   │     │              │
│ A record ────│────▶│              │────▶│              │
│ (alias to CF)│     │ Error pages  │     │              │
└──────────────┘     │ (404 → 404/) │     └──────────────┘
                     └──────────────┘

┌──────────────┐
│     ACM      │
│              │
│ SSL cert for │
│ *.jirka-     │
│ sindelar.dev │
│              │
│ (us-east-1)  │
└──────────────┘

┌──────────────┐
│     IAM      │
│              │
│ Deploy user  │
│ - s3:PutObj  │
│ - s3:DeleteObj│
│ - s3:ListBucket│
│ - cloudfront:│
│   CreateInval│
│              │
│ (least priv.)│
└──────────────┘
```

**AWS services and their roles:**

| Service | Purpose | Configuration |
|---|---|---|
| **S3** | Origin storage for all static files | Private bucket, no public access. Bucket policy allows CloudFront OAI only. |
| **CloudFront** | CDN — serves files globally with HTTPS | Custom domain, ACM certificate, Origin Access Identity, default root object `index.html`, custom error response for 404. |
| **Route 53** | DNS | Hosted zone for `jirkasindelar.dev`. A record (alias) pointing to CloudFront distribution. |
| **ACM** | SSL/TLS certificate | Wildcard cert for `*.jirkasindelar.dev` + `jirkasindelar.dev`. Must be in `us-east-1` (CloudFront requirement). DNS validation via Route 53. |
| **IAM** | Deploy permissions | Dedicated IAM user with least-privilege policy: S3 write/delete/list on the site bucket + CloudFront invalidation on the distribution. Access keys stored as GitHub Secrets. |

### Deploy pipeline (GitHub Actions)

```
git push to main
       │
       ▼
┌─────────────────────────────┐
│  GitHub Actions runner      │
│                             │
│  1. checkout code           │
│  2. npm ci                  │
│  3. astro build → dist/     │
│  4. aws s3 sync dist/ s3:// │
│  5. aws cloudfront          │
│     create-invalidation     │
└─────────────────────────────┘
       │
       ▼
  Site is live (~1-2 min)
```

**First few deploys are manual** (per DP-6/DP-9 learn-then-automate approach), then the GitHub Actions workflow takes over.

### v2 transition

When API routes are needed for the avatar, the manual AWS setup is replaced by SST:

```typescript
// sst.config.ts (v2)
new sst.aws.Astro("Site", {
  domain: "jirkasindelar.dev"
});
```

SST creates the same infrastructure (S3, CloudFront, Route 53) plus Lambda for API routes. The GitHub Actions workflow changes from `aws s3 sync` to `sst deploy`.

---

## Module / Component Breakdown

### Directory structure

```
/
├── src/
│   ├── content/                    # Content Collections (DP-4)
│   │   ├── config.ts               # Collection schemas (Zod)
│   │   ├── blog/                   # Blog posts (.md)
│   │   │   ├── first-post.md
│   │   │   └── ...
│   │   └── projects/               # Portfolio projects (.md)
│   │       ├── project-one.md
│   │       └── ...
│   │
│   ├── pages/                      # File-based routing
│   │   ├── index.astro             # Landing page (FR-1)
│   │   ├── about.astro             # Bio / personal story (FR-2)
│   │   ├── projects/
│   │   │   └── index.astro         # Portfolio index (FR-3)
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog index (FR-4)
│   │   │   └── [...slug].astro     # Individual blog post (FR-4)
│   │   └── 404.astro               # Custom 404 page
│   │
│   ├── layouts/                    # Page layouts
│   │   ├── BaseLayout.astro        # HTML shell: <head>, <body>, nav, footer
│   │   └── BlogPostLayout.astro    # Blog post wrapper: title, date, prose
│   │
│   ├── components/                 # Reusable components
│   │   ├── Header.astro            # Navigation + contact links (FR-5)
│   │   ├── Footer.astro            # Contact links, copyright (FR-5)
│   │   ├── BlogCard.astro          # Blog post preview card
│   │   ├── ProjectCard.astro       # Portfolio project preview card
│   │   ├── Hero.astro              # Landing page hero section
│   │   ├── SEOHead.astro           # OG/Twitter meta tags (FR-10)
│   │   ├── JsonLd.astro            # Structured data for agents (NFR-9)
│   │   └── islands/                # Interactive React components
│   │       └── EasterEgg.tsx       # Easter egg / game (FR-7)
│   │
│   └── styles/
│       └── global.css              # Tailwind directives + any global styles
│
├── public/                         # Static assets (copied as-is)
│   ├── cv.pdf                      # Downloadable CV (FR-6)
│   ├── og-image.png                # Default Open Graph image (FR-10)
│   ├── favicon.svg                 # Favicon
│   └── robots.txt                  # Crawl directives
│
├── astro.config.mjs                # Astro configuration
├── tailwind.config.mjs             # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Actions deploy pipeline
```

### Component responsibilities

**Layouts** — structural wrappers that every page uses:

| Layout | Responsibility | Used by |
|---|---|---|
| `BaseLayout.astro` | HTML `<head>` (charset, viewport, fonts, Tailwind), `<Header>`, `<Footer>`, `<SEOHead>`, `<JsonLd>`, `<slot>` for page content. Every page wraps in this. | All pages |
| `BlogPostLayout.astro` | Extends BaseLayout. Adds post title, date, tags, reading time, and wraps content in `<article class="prose">` for Tailwind Typography styling. | Blog post pages |

**Pages** — each `.astro` file in `src/pages/` becomes a route:

| Page | Route | FR | What it does |
|---|---|---|---|
| `index.astro` | `/` | FR-1 | Landing page: hero (name, role, seniority signal), recent blog posts, recent projects, entry points to bio/portfolio/blog. |
| `about.astro` | `/about` | FR-2, FR-11 | Narrative bio, "what I'm open to" section, seniority signal near top. |
| `projects/index.astro` | `/projects` | FR-3 | Portfolio grid/list. Selected/highlighted projects first. |
| `blog/index.astro` | `/blog` | FR-4 | Reverse-chronological blog index. Title, date, description per post. |
| `blog/[...slug].astro` | `/blog/{slug}` | FR-4 | Individual blog post. Rendered from markdown via Content Collections. |
| `404.astro` | `/404` | — | Custom 404 page (opportunity for humor, FR-7). |

**Components** — reusable pieces:

| Component | Type | Responsibility |
|---|---|---|
| `Header.astro` | Static | Navigation (Home, About, Projects, Blog) + contact links (LinkedIn, GitHub, email). Present on every page via BaseLayout. FR-5. |
| `Footer.astro` | Static | Contact links (redundant with header for accessibility), copyright, optional humor. FR-5. |
| `Hero.astro` | Static | Landing page hero: name, tagline, current role, seniority signal. First thing visitors see. US-5, US-11. |
| `BlogCard.astro` | Static | Preview card for blog posts: title, date, description. Used on landing page and blog index. |
| `ProjectCard.astro` | Static | Preview card for portfolio projects: title, description, tech tags, links. Used on landing page and portfolio index. |
| `SEOHead.astro` | Static | `<meta>` tags for Open Graph and Twitter Cards. Accepts title, description, image as props. FR-10. |
| `JsonLd.astro` | Static | `<script type="application/ld+json">` for structured data: Person schema (name, role, sameAs links), BlogPosting schema per post, WebSite schema. NFR-9. |
| `islands/EasterEgg.tsx` | React island | Interactive easter egg (game, animation, or hidden surprise). Hydrates with `client:visible` or `client:idle`. FR-7. This is the only React component in v1 — the island that justifies the islands architecture. |

### Static vs. island boundary

The **island boundary** is the line between "ships as HTML" and "ships as JavaScript." In v1, this boundary is simple:

| | Static (HTML only) | Island (React + JS) |
|---|---|---|
| **Everything except easter eggs** | ✅ | |
| **Easter egg / interactive game** | | ✅ |

This means v1 ships near-zero JavaScript. The only JS is the easter egg island(s), loaded lazily (`client:visible` — only hydrates when scrolled into view, or `client:idle` — hydrates when the browser is idle). A visitor who never encounters the easter egg downloads zero JavaScript.

---

## Conceptual Data Model

There is no database. Content is modeled as **Astro Content Collections** — typed markdown files with Zod-validated frontmatter schemas.

### Content schemas

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),         // Tech stack tags
    sourceUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false), // Highlighted projects shown first
    order: z.number().optional(),         // Manual sort order for featured
  }),
});

export const collections = { blog, projects };
```

### Content file examples

**Blog post** (`src/content/blog/first-post.md`):
```markdown
---
title: "Building My Personal Site from Scratch"
description: "What I learned going through the full SDLC — from BRD to deployment."
date: 2026-04-15
tags: ["astro", "aws", "learning"]
draft: false
---

Blog content in markdown...
```

**Portfolio project** (`src/content/projects/personal-site.md`):
```markdown
---
title: "Personal Website & Digital Avatar"
description: "Astro + TypeScript + Tailwind on AWS — built from scratch through full SDLC."
tags: ["Astro", "TypeScript", "Tailwind", "AWS"]
sourceUrl: "https://github.com/jirkasindelar/website"
featured: true
order: 1
---

Project writeup in markdown...
```

### How content is queried

```typescript
// In any .astro page:
import { getCollection } from 'astro:content';

// All published blog posts, newest first
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Featured projects first, then the rest
const projects = (await getCollection('projects'))
  .sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return (a.data.order ?? 99) - (b.data.order ?? 99);
  });
```

All queries execute at **build time**. The output is static HTML — no runtime data fetching.

### Static assets (non-content)

| Asset | Location | Purpose |
|---|---|---|
| CV PDF | `public/cv.pdf` | Downloadable CV (FR-6). Updated manually. |
| OG image | `public/og-image.png` | Default social preview image (FR-10). |
| Favicon | `public/favicon.svg` | Browser tab icon. |
| Blog images | `src/assets/blog/` or `public/blog/` | Images referenced from blog posts. |

---

## API / Interface Overview

### v1: No API — static HTML only

v1 has no API endpoints. The "interface" is the set of URLs that visitors (human or agent) can request:

| URL pattern | Returns | Content |
|---|---|---|
| `/` | HTML | Landing page |
| `/about` | HTML | Bio / personal story |
| `/projects` | HTML | Portfolio index |
| `/blog` | HTML | Blog index |
| `/blog/{slug}` | HTML | Individual blog post |
| `/cv.pdf` | PDF | Downloadable CV |
| `/robots.txt` | Text | Crawl directives |
| `/sitemap-index.xml` | XML | Sitemap (Astro generates this) |

### Agent interface (v1 — passive)

Agents consume the site via structured markup embedded in the HTML:

**JSON-LD (structured data):**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jirka Sindelar",
  "jobTitle": "Software Engineer",
  "url": "https://jirkasindelar.dev",
  "sameAs": [
    "https://linkedin.com/in/jirkasindelar",
    "https://github.com/jirkasindelar"
  ],
  "knowsAbout": ["software engineering", "agentic design", "TypeScript", "AWS"]
}
```

**Open Graph meta tags** (for social previews and agent-readable metadata):
```html
<meta property="og:title" content="Jirka Sindelar — Software Engineer" />
<meta property="og:description" content="Builder, writer, ..." />
<meta property="og:image" content="https://jirkasindelar.dev/og-image.png" />
<meta property="og:url" content="https://jirkasindelar.dev" />
<meta property="og:type" content="website" />
```

**Semantic HTML:** Proper heading hierarchy (`h1` → `h2` → `h3`), `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`, `<section>` landmarks. Agents and screen readers parse the same structure.

### v2 API (future — not built in v1)

For reference, the v2 avatar API would add endpoints like:

| Endpoint | Purpose |
|---|---|
| `GET /api/avatar/capabilities` | MCP-style capability manifest |
| `GET /api/avatar/about` | Structured bio data |
| `GET /api/avatar/posts` | Blog posts as JSON |
| `GET /api/avatar/projects` | Portfolio projects as JSON |
| `GET /api/avatar/soul` | soul.md — avatar identity |

These would be Astro API routes deployed as Lambda via SST. Not built now, but the content structure (typed Content Collections) makes adding them trivial — the data is already structured and queryable.

---

## Data Flow

### Build & deploy flow

```
1. AUTHOR
   Jirka writes/edits .md file in VS Code
            │
            ▼
2. COMMIT
   git add → git commit → git push (to main)
            │
            ▼
3. CI/CD (GitHub Actions)
   Triggered by push to main
   ├── checkout code
   ├── npm ci (install dependencies)
   ├── astro build
   │   ├── Read src/content/**/*.md
   │   ├── Validate frontmatter against Zod schemas
   │   ├── Render .astro pages with content data
   │   ├── Compile Tailwind (JIT — only used classes)
   │   ├── Bundle React islands (tree-shaken)
   │   └── Output → dist/ (static HTML, CSS, JS, assets)
   ├── aws s3 sync dist/ s3://bucket --delete
   └── aws cloudfront create-invalidation --paths "/*"
            │
            ▼
4. CDN
   CloudFront caches files at edge locations
   Subsequent requests served from cache (fast)
            │
            ▼
5. VISITOR
   Browser requests jirkasindelar.dev
   ├── DNS: Route 53 → CloudFront
   ├── CloudFront: serve cached HTML (or fetch from S3)
   ├── Browser: render HTML + CSS (instant)
   └── Browser: hydrate island JS (lazy, only easter eggs)
```

### Request flow (visitor perspective)

```
Visitor types jirkasindelar.dev
       │
       ▼
Route 53 DNS resolution
       │ → CloudFront distribution IP
       ▼
CloudFront edge location (nearest to visitor)
       │
       ├── Cache HIT → serve immediately (~5-20ms)
       │
       └── Cache MISS → fetch from S3 origin
              │ → cache at edge
              │ → serve to visitor (~50-100ms)
              ▼
         Browser renders HTML
              │
              ├── Parse HTML → render text and layout (instant)
              ├── Load CSS (Tailwind, <10KB gzipped) → apply styles
              ├── Load island JS (only if page has islands)
              │   └── Hydrate React component (easter egg)
              └── Done — page is interactive
```

**Key performance characteristic:** First Contentful Paint happens before any JavaScript loads. Text, navigation, blog content — everything meaningful is in the HTML. JavaScript (if any) enhances after the page is already readable. This is the core benefit of the islands architecture.

---

## Security Considerations

### Attack surface

The attack surface of a static site is minimal:

| Vector | Risk | Mitigation |
|---|---|---|
| **Server compromise** | No server to compromise. | Static files on S3, served via CloudFront. No application code runs at request time. |
| **SQL injection / XSS** | No database, no user input, no dynamic rendering. | Content is built at build time from trusted markdown. No forms, no user-generated content. |
| **DDoS** | CloudFront is a global CDN — absorbs traffic at edge. | AWS Shield Standard (included with CloudFront) provides DDoS protection. Aggressive traffic patterns are mitigated at the CDN layer. |
| **S3 bucket exposure** | Misconfigured bucket could expose files publicly. | S3 bucket is **private**. Access only via CloudFront Origin Access Identity (OAI). No public bucket policy. |
| **IAM credential leak** | Deploy credentials (GitHub Secrets) could be compromised. | Least-privilege IAM policy: deploy user can only write to the specific S3 bucket and invalidate the specific CloudFront distribution. No admin access. Credentials stored as GitHub encrypted secrets, never in code. |
| **Dependency supply chain** | Malicious npm package in build dependencies. | `package-lock.json` pins exact versions. `npm ci` in CI ensures reproducible installs. Regularly update dependencies. |
| **HTTPS downgrade** | Visitor connects over HTTP instead of HTTPS. | CloudFront configured to redirect HTTP → HTTPS. `.dev` TLD enforces HTTPS at the browser level (HSTS preloaded). |

### Security headers

CloudFront custom response headers (configured on the distribution):

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS for one year |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` | Restrict resource loading to same origin. `unsafe-inline` needed for Tailwind/Astro scoped styles. Tighten as needed. |

### Secrets management

| Secret | Stored in | Used by |
|---|---|---|
| AWS Access Key ID | GitHub Secrets | GitHub Actions deploy workflow |
| AWS Secret Access Key | GitHub Secrets | GitHub Actions deploy workflow |
| S3 bucket name | GitHub Secrets or workflow env | Deploy workflow |
| CloudFront distribution ID | GitHub Secrets or workflow env | Cache invalidation step |

No secrets are committed to the repository. No secrets are needed at runtime (the site is static).

---

## Quality Attributes (NFR Mapping)

How each non-functional requirement from the PRD is addressed architecturally:

| NFR | Requirement | How the architecture addresses it |
|---|---|---|
| **NFR-1 — Performance** | Site must feel instant | Static HTML on CDN. No server rendering, no database queries, no heavy JS. Tailwind produces <10KB CSS. Islands load lazily. CloudFront edge caching means most requests are served from a location near the visitor. |
| **NFR-2 — Accessibility** | Semantic HTML, keyboard nav, focus states, alt text | BaseLayout enforces semantic structure (`<nav>`, `<main>`, `<article>`, `<footer>`). Heading hierarchy maintained per page. Tailwind's `focus:` and `focus-visible:` utilities for focus states. Alt text enforced by content review (no automated enforcement in v1). |
| **NFR-3 — Browser support** | Latest 2 versions of Chrome, Firefox, Safari, Edge + mobile | Astro outputs standard HTML/CSS. Tailwind targets modern browsers by default. No polyfills needed. React islands use standard APIs. Smoke-tested per M3 milestone. |
| **NFR-4 — No third-party trackers** | No ad/tracking scripts | No Google Analytics, no Facebook Pixel, no third-party scripts of any kind in v1. Analytics (deferred to M3) will use a privacy-first solution. CSP header restricts script loading to same origin. |
| **NFR-5 — No cookie banner** | Analytics without consent requirement | Deferred analytics (Umami/Plausible) are cookieless. v1 ships zero cookies. No consent mechanism needed. |
| **NFR-6 — No personal data** | Aggregate, anonymized only | No forms, no accounts, no server-side data storage. The site collects nothing. Deferred analytics will use anonymized, non-PII metrics. |
| **NFR-7 — Maintainability** | Edit content in source files, publish via commit | Markdown files in git → commit → push → auto-deploy. Content Collections validate schema at build time — a broken frontmatter field fails the build, not the live site. |
| **NFR-8 — Future extendability** | Must not foreclose backend addition | Astro supports API routes (server endpoints) natively. SST deploys them as Lambda. Content Collections are already structured and queryable — adding a JSON API endpoint means calling `getCollection()` in an API route instead of a page. The v1→v2 path is a feature addition, not a rewrite. |
| **NFR-9 — Agent-friendliness** | Consumable by AI agents | JSON-LD Person and BlogPosting schemas. Open Graph metadata on every page. Semantic HTML with proper landmarks. Clean URL structure. `robots.txt` allows crawling. Sitemap generated by Astro. In v2, these passive signals become active API endpoints. |

---

## Design Decisions & Alternatives

All technology and architecture decisions, including the full landscape of alternatives considered and the reasoning behind each choice, are documented in [Technology Decisions.md](Technology%20Decisions.md).

**Key architectural decisions summarized:**

1. **Islands over SPA** — ship HTML, not a JavaScript app. JS only where interactivity is needed.
2. **Astro over Next.js** — content-first framework, zero JS by default. React learned through islands, not as the whole architecture.
3. **Markdown over CMS** — content in git, no external dependency. Schema-validated via Content Collections.
4. **Tailwind over plain CSS** — ship fast, design system included. `prose` plugin solves blog typography.
5. **Manual AWS before SST** — understand the infrastructure before abstracting it.
6. **GitHub Actions over AWS CodePipeline** — industry-standard CI/CD, portable knowledge.

---

## Open Questions & Risks

### Open questions (to resolve during implementation)

| # | Question | When to resolve | Impact |
|---|---|---|---|
| 1 | **Image optimization strategy** — Astro has `<Image>` component for build-time optimization. How to handle blog post images? Inline in markdown (limited control) vs. custom component (requires MDX)? | M2 (Content) | Affects page load performance and content authoring workflow. |
| 2 | **Blog post URL structure** — `/blog/{slug}` (flat) or `/blog/{year}/{slug}` (dated)? Flat is simpler; dated avoids slug collisions and signals freshness. | M1 (Skeleton) | URL is permanent once published — hard to change later. |
| 3 | **Easter egg scope** — what is the easter egg? A game? An animation? A hidden page? A Konami code? This affects whether React is even needed as an island or if vanilla JS suffices. | M3 (Polish) | Determines whether React is a build dependency. |
| 4 | **CV PDF management** — static file in `public/`, or generated from a source (LaTeX, markdown)? Static is simpler; generated ensures consistency if the CV is also maintained elsewhere. | M2 (Content) | Minor — affects maintainability of CV content. |
| 5 | **Dark mode** — Tailwind supports dark mode natively (`dark:` prefix). Include in v1 or defer? | M1 or M3 | Affects design work scope. Easier to include from the start than retrofit. |
| 6 | **Domain availability** — is `jirkasindelar.dev` available? Fallback to `.com` if not. | Before M1 | Blocks AWS setup. |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Over-engineering delays launch** (from BRD) | High | High | Milestones enforce scope. M1 = skeleton, M2 = content, M3 = polish. Don't gold-plate M1. |
| **AWS manual setup takes longer than expected** | Medium | Medium | Accept the time investment as learning. Document every step. If truly stuck, fall back to SST for v1 (violates learn-then-automate but unblocks shipping). |
| **Tailwind `prose` doesn't match desired blog typography** | Low | Low | `prose` is customizable via Tailwind config. Or override specific styles with Astro scoped CSS. |
| **React island adds unexpected bundle size** | Low | Low | Measure with `astro build` output. If the easter egg doesn't need React, use vanilla JS instead. |
| **CloudFront cache invalidation causes stale content** | Medium | Low | Invalidate `/*` on every deploy. If needed, add cache-busting hashes to asset filenames (Astro does this by default for CSS/JS). |
| **Content Collections schema changes break existing posts** | Low | Low | Zod schemas can use `.optional()` and `.default()` for backward compatibility. Schema changes are caught at build time. |
