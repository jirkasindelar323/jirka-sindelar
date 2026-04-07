# Technology Decisions

## How to use this document

This document is a **decision workshop** — a structured exploration of every technology and architecture choice needed to build the website described in [BRD.md](BRD.md) and [PRD.md](PRD.md).

**But it's more than that.** Each decision point doesn't just list options for this project — it explains what each technology **enables as a business capability**. The goal is to build the mental model of a senior architect: someone who doesn't just pick tools, but understands what products and business models each technology makes possible, and uses that knowledge to shape what gets built.

For each decision point:
1. **What needs to be decided** — the question in plain language.
2. **Why it matters** — what BRD/PRD constraints make this decision consequential.
3. **Full landscape of options** — every reasonable option, with:
   - How it works (technical explanation)
   - What it enables (business capabilities it unlocks — what products become possible)
   - Trade-offs (honest, not pre-filtered)
4. **How this fits your project** — mapping options against BRD/PRD constraints.
5. **Discussion** — space for questions, exploration, and learning before choosing.
6. **Decision** — what was chosen and why. Filled in only after the discussion is complete.

**Decision points are ordered by dependency.** Each one constrains the options available in the next. The order is:

1. **Rendering Strategy** — how does the site turn into what visitors see?
2. **Framework / Tool** — what specific tool implements the rendering strategy?
3. **Programming Language** — what language do we write the code in?
4. **Content Management** — how is content (blog posts, bio, portfolio) authored and stored?
5. **Styling Approach** — how is the site visually styled?
6. **Hosting / Infrastructure** — where does the site live and how is it served?
7. **Domain** — what URL do visitors type?
8. **Analytics** — how do we measure the BRD's KPIs?
9. **CI/CD Pipeline** — how does code go from "committed" to "live"?
10. **Source Hosting** — where does the code repository live?

---

## DP-1: Rendering Strategy

When a visitor types the URL into their browser, **how does the site turn into the page they see?** This is the most fundamental architectural decision — everything else (framework, hosting, infrastructure complexity, cost, performance, security) follows from it.

### Constraints from BRD/PRD

- Fast mobile load (US-5, NFR-1) — must feel instant
- No accounts, no DB, no dynamic features in v1 — but must not foreclose adding a backend later (NFR-8)
- Content authored by one person, changes infrequently
- Digital avatar vision: v1 static for humans → v2 API for agents → v3 conversational AI avatar

### Options considered

| Strategy | How it works | Best for | Not for |
|---|---|---|---|
| **SSG** | All pages pre-built at build time → plain HTML served as-is. Like printing a magazine. | Content sites at near-zero cost, global CDN performance, maximum security (no server to hack). Blogs, docs, portfolios, marketing sites. | Per-user personalization, real-time data, user-generated content. |
| **SSR** | Server generates HTML on each request. Like a restaurant kitchen — cooked fresh per order. | Personalized products (Netflix, banking dashboards), SaaS, real-time data, full-stack in one codebase. | Static content — unnecessary server work per request, more cost, more ops. |
| **SPA** | Server sends empty HTML + large JS bundle. Browser renders everything client-side. | App-like experiences (Figma, Notion, Google Docs), complex interactive tools, offline-capable products. | Content sites — slow first load, SEO challenges, overkill for reading. |
| **Hybrid/Islands** ✅ | Pages are statically generated, but specific parts ("islands") hydrate independently with JS. Rest is pure HTML. | Content sites that need targeted interactivity. SSG speed with surgical JS where needed. | Full-page interactivity (dashboards). No benefit over SSG if zero interactivity. |
| **MPA** | Traditional server renders full HTML per request (PHP, Rails, Django). Every nav is a full page reload. | Fastest path to full product with DB/auth/admin. Battle-tested in enterprise. | Static sites — adds unnecessary infrastructure. Clunkier UX. |
| **Edge Rendering** | Code runs at CDN edge locations near the visitor. Dynamic content with near-static latency. | SSR speed + SSG latency. Geo-awareness, A/B testing, API gateways. Complements SSG/Hybrid. | Heavy computation, long-running processes. Constrained environment. |

*(Full exploration of each option's business capabilities, trade-offs, and who uses them was done during the decision process. See [1_TECHNOLOGY_GOD.md](../learning/1_TECHNOLOGY_GOD.md) and [2_AI_ACCELERATION.md](../learning/2_AI_ACCELERATION.md) for the architect's mental model on technology landscape knowledge.)*

### Decision


**Chosen:** Hybrid / Islands Architecture + Edge Rendering (as complementary layer)

**Why:** The website has a dual long-term identity — human-facing (portfolio, blog, personality) and agent-facing (digital avatar). Hybrid gives the best fit for v1: static content that loads instantly on mobile (US-5, NFR-1), zero server infrastructure, free hosting — while islands provide a natural home for interactive elements (FR-7 easter eggs) without shipping unnecessary JS.

Edge rendering is not the primary rendering strategy but a complementary layer that becomes relevant in v2/v3 — edge functions on AWS (CloudFront Functions, Lambda@Edge) will serve the avatar's API endpoints globally with low latency.

The combination maps cleanly to AWS and supports the full evolution:
- **v1:** Static HTML + island JS bundles → S3 + CloudFront. Learn AWS fundamentals (storage, CDN, DNS, SSL, IAM).
- **v2:** API endpoints for agent consumption → Lambda@Edge or Lambda + API Gateway behind the same CloudFront distribution. Learn serverless and edge computing.
- **v3:** Interactive AI avatar → Lambda/ECS + Bedrock. Learn cloud AI integration.

**What it enables for future projects (what you learned):**
- The islands mental model — understanding when and why to hydrate parts of a page — transfers to any content-heavy product that needs targeted interactivity.
- The static-first + progressive enhancement pattern is the architecture behind most modern content businesses.
- The hybrid-to-API evolution path is directly applicable to the "apps become APIs" thesis from [3_AGENTIC_DESIGN.md](../learning/3_AGENTIC_DESIGN.md).
- AWS infrastructure knowledge compounds across every future project.

**What was traded away:**
- Not learning full-stack SSR patterns in v1 (deferred to v2/v3 when API routes are added).
- Not learning traditional MPA patterns (Rails/Django) — but these are well-documented and can be learned separately.
- Edge rendering constraints (limited execution time, restricted APIs) will require workarounds for heavier v3 logic — may need Lambda or ECS, not just edge functions.
- Hybrid/Islands is a newer pattern with a smaller community than SSR or traditional SSG — fewer tutorials, more self-reliance.

---

## DP-2: Framework / Tool

Given Hybrid/Islands rendering on AWS, **which framework do we build with?** DP-1 eliminates pure SPA frameworks and pure MPA frameworks. What remains are modern meta-frameworks that produce static output with selective interactivity.

### Options considered

| Framework | How it works | AWS story | Best for | Limitation |
|---|---|---|---|---|
| **Astro** ✅ | Islands-native. Zero JS by default, opt in per-component with `client:` directives. Can use React/Vue/Svelte components inside. Built-in content collections with type safety. | First-class SST support. `new sst.aws.Astro("Site")` handles S3, CloudFront, Lambda for API routes. | Content sites with targeted interactivity. Exactly what we're building. | Smaller community than Next.js. Less industry adoption. Astro-specific syntax not transferable. |
| **Next.js** | React meta-framework. SSG/SSR/ISR/Edge mixed per page. Server Components = static by default, `"use client"` for interactivity. Largest ecosystem. | First-class SST support via OpenNext. Most complex deployment (more features = more Lambda functions). | Full-stack React apps. Industry standard. Best career investment for React roles. | Not true islands — ships React runtime (~80-100KB) even for content pages. Heavier than needed for content site. |
| **SvelteKit** | Svelte compiles to vanilla JS (no runtime). SSG + SSR + API routes. Simplest syntax — feels like enhanced HTML. | SST support via adapter-node, less mature. Fewer deployment guides. | Smallest JS footprint for interactive sites. Elegant mental model. | Smallest ecosystem. Least employable. Svelte 5 API change causing community fragmentation. |
| **Eleventy** | Pure static site generator. Templates → HTML, zero framework. Add vanilla JS manually for interactivity. | Simplest: build → S3 → CloudFront. But no built-in API routes — v2 avatar needs separate Lambda project. | Maximum simplicity. Pure web fundamentals. | No islands, no component model, no API routes. v1→v2 gap is a bigger jump. |

### Cost

All four frameworks are free and open source. The cost is in AWS hosting, which depends on the rendering model and evolution stage.

**v1 — Static site (all frameworks produce static files):**

| AWS Service | What it does | Cost |
|---|---|---|
| S3 | Stores HTML/CSS/JS files | ~$0.02/month |
| CloudFront | CDN — serves files globally | Free tier: 1TB/month first year. After: ~$0.085/GB |
| Route 53 | DNS (connects domain) | $0.50/month |
| ACM | SSL certificate (https://) | Free |

**v1 total: ~$0.50-1/month.** Essentially just DNS. Free tier covers everything else at personal-site traffic volumes.

**v2 — API layer for avatar (Lambda + API Gateway):**

| AWS Service | What it does | Cost |
|---|---|---|
| Lambda | Runs avatar API code | Free tier: 1M requests/month. After: $0.20 per 1M |
| API Gateway | Routes requests to Lambda | Free tier: 1M calls/month first year. After: $3.50 per 1M |

**v2 total: ~$1-2/month.** Personal avatar traffic stays within or near free tier.

**v3 — Conversational AI avatar (+ LLM):**

| Service | What it does | Cost |
|---|---|---|
| Bedrock (Claude Haiku) | LLM for conversation | ~$0.01-0.05 per conversation |
| Or Anthropic API directly | Same, external to AWS | Similar token-based pricing |

**v3 total: depends on usage.** 100 conversations/month ≈ $1-5/month. Needs a budget cap if traffic grows.

**Comparison: AWS vs. easy alternatives**

| | AWS (S3+CloudFront) | Vercel/Netlify | Cloudflare Pages |
|---|---|---|---|
| v1 cost | ~$0.50-1/mo | Free | Free |
| v1 setup effort | Medium (learn IAM, S3, CloudFront) | One click | One click |
| v2 cost | ~$1-2/mo | Free tier exists | Free tier (Workers) |
| v3 cost | LLM tokens + Lambda | LLM tokens + serverless | LLM tokens + Workers |
| **What you learn** | **Real cloud infrastructure** | Platform abstractions | Edge computing |

The honest tradeoff: AWS costs slightly more and requires significantly more setup effort. You're paying in time and complexity to learn real infrastructure. Vercel/Netlify gives you free, one-click deploys — but you learn almost nothing about how hosting actually works. The domain (DP-7) is the biggest fixed cost regardless: ~$10-15/year.

### Decision

**Chosen:** Astro (with React components for interactive islands)

**Why:** Astro is the natural architectural fit for Hybrid/Islands on a content-first site. It starts with HTML — familiar territory coming from backend — and adds complexity only where needed. The key insight that resolved the Astro-vs-Next.js tension: **the career investment is React, not Next.js.** Astro lets you use real React components as islands — same JSX, same hooks, same patterns that interviews test. You learn React gradually (one island at a time) rather than immersively (everything is React from day one), which fits the "build minimal, play with it" approach and the reality of never having built a frontend from scratch.

The v1→v2→v3 path is supported: Astro API routes deploy as Lambda via SST, covering the avatar API. If Astro's limits are ever hit in v3 (heavy full-stack patterns), migrating to Next.js is a weekend project — markdown content is portable, React components transfer as-is, AWS infrastructure stays the same. By then you'll know exactly WHY you need Next.js, which means you'll use it effectively.

**What it enables for future projects (what you learned):**
- HTML/CSS/JS fundamentals without framework abstraction hiding the web platform.
- React — learned incrementally through real interactive components, transferable to any React project or Next.js.
- Islands architecture mental model — understanding when and why to hydrate, applicable to any content-heavy product.
- Astro's content collections — typed, schema-validated content management pattern.
- The full Astro + SST + AWS deployment chain.

**What was traded away:**
- Not learning Next.js-specific patterns (Server Components, App Router, ISR, middleware) — these matter for senior React roles but not for current learning stage. Can be learned later if/when migrating.
- Smaller community than Next.js — fewer tutorials, fewer Stack Overflow answers when stuck.
- Astro template syntax (`.astro` files) is not transferable — but it's close to HTML, so the knowledge loss is minimal.
- Less industry name recognition — "I built this in Astro" impresses less in a job interview than "I built this in Next.js." The React components in the portfolio compensate for this.

---

## DP-3: Programming Language

### Decision

**Chosen:** TypeScript (JavaScript with types)

**Why:** Astro uses JavaScript/TypeScript natively. TypeScript is the industry default for any serious frontend or full-stack project — it catches errors at build time, provides autocompletion in the IDE, and is the language of the React ecosystem you'll be writing islands in. Coming from Java, TypeScript's type system will feel familiar (interfaces, generics, type annotations) while being less ceremonious. Astro supports TypeScript out of the box with zero config.

**What was traded away:** Nothing meaningful. Plain JavaScript is the only alternative, and it's strictly less capable for a project that will grow. The small overhead of learning TypeScript-specific syntax (union types, type inference, `as const`) pays for itself immediately in editor support and fewer runtime bugs.

*(No full landscape exploration needed — DP-2 constrains this to JavaScript or TypeScript, and the choice between them is straightforward.)*

---

## DP-4: Content Management

Every website has content — text, images, data — and something has to answer three questions: **where does it live?** (storage), **how do you edit it?** (authoring experience), and **how does it get into the page?** (delivery). The answers to these questions define your content management approach. For a personal blog, the stakes feel low. For a media company, a SaaS product, or an e-commerce site, content management is the entire business — and the architecture choice determines what products and workflows are possible.

### Constraints from BRD/PRD

- NFR-7: Content must be editable directly in source files (markdown or similar), publishable in a single commit. No external CMS dependency.
- Single author (Jirka), technical, comfortable with git and VS Code.
- Content types: blog posts (the retention driver), portfolio projects, bio, "what I'm open to" copy.
- Blog must support headings, code blocks, images, and links (FR-4).
- Content changes infrequently — no real-time publishing pressure.
- v2/v3 avatar will need to consume content programmatically (agentic design consideration).

### Options considered

#### 1. Raw HTML in components

Content is hardcoded directly in `.astro` or `.tsx` files — no separation between content and presentation.

```astro
<!-- src/pages/blog/my-post.astro -->
<Layout>
  <h1>My Post Title</h1>
  <p>Published: 2026-04-07</p>
  <p>Here is the content, mixed in with HTML tags...</p>
</Layout>
```

**What it enables as a business capability:**
- Nothing beyond what the other options provide. This is the absence of a content strategy.
- Works for hardcoded pages that rarely change (legal pages, about pages with stable copy).

**Trade-offs:**
- Zero abstraction — you control every pixel.
- But content and presentation are tangled. Changing how blog posts look means editing every post file. Adding metadata (tags, dates, descriptions) means manually keeping HTML structures consistent.
- No way to query or list content programmatically (e.g., "show the 5 most recent posts on the homepage") without manual maintenance.
- Scales terribly. At 5 posts it's manageable; at 50 it's a maintenance nightmare.
- The avatar (v2/v3) would have no structured content to consume — it would need to parse HTML.

**Who uses this:** Almost no one for content-heavy sites. Sometimes seen in single-page marketing sites or landing pages where every pixel is custom-designed and content never changes.

#### 2. Markdown in git (with a framework's content layer)

Content lives as `.md` files in the repository. A framework feature (like Astro's Content Collections) reads these files at build time, validates their frontmatter against a schema, and makes them queryable.

```markdown
---
# src/content/blog/my-post.md
title: "My Post Title"
date: 2026-04-07
tags: ["typescript", "learning"]
description: "What I learned building my first Astro site."
---

Here is the content in **markdown**. Just text.

## A heading

A code block:
```ts
const x: number = 42;
```                                          
```


The framework's content layer (Astro Content Collections) provides:
- **Schema validation** — define what frontmatter fields exist and their types. A post without a `title` or with a malformed `date` fails the build, not silently renders wrong.
- **Type safety** — TypeScript knows that `post.data.title` is a string and `post.data.tags` is a `string[]`. Autocompletion in VS Code.
- **Queryable** — `getCollection('blog')` returns all posts. Sort by date, filter by tag, paginate — all type-safe.
- **Automatic slug generation** — file name becomes the URL. `my-post.md` → `/blog/my-post`.

**What it enables as a business capability:**
- **Content as data.** Once content is structured (typed frontmatter + body), it's not just "a page" — it's a queryable dataset. This is the foundation of any content-driven product: blogs, documentation sites, knowledge bases, course platforms, recipe sites. The pattern is always the same: structured content → query → render.
- **Git as CMS.** Every edit is a commit. You get version history, diffs, branching (draft a post on a branch, merge to publish), pull request reviews, and rollback — all for free. For a solo author, this is more powerful than most CMS admin panels.
- **Portable content.** Markdown is universal. If you ever outgrow Astro, your content moves with you — Next.js, Hugo, Eleventy, or any system that reads markdown. No vendor lock-in.
- **Agent-friendly (v2/v3).** Structured frontmatter + markdown body is trivially parseable by an AI agent. The avatar can consume your blog posts, portfolio, and bio as structured data without scraping HTML.
- **Static site economics.** Content rendered at build time = HTML files on a CDN. No server, no database, no CMS hosting cost. The entire content pipeline is free.

**Trade-offs:**
- Authoring experience is a text editor + git. No visual preview while writing (unless you set up a local dev server or use an editor with markdown preview). No drag-and-drop images, no WYSIWYG formatting.
- Images require manual handling — save the file, reference the path in markdown, ensure it's optimized. No automatic resizing or format conversion (unless you add tooling).
- Non-technical people cannot contribute content without learning git.
- Content and code live in the same repo — a blog post commit triggers the same CI/CD pipeline as a code change.

**Who uses this:** Developer blogs, documentation sites (Stripe, Tailwind, Astro's own docs), open-source project sites, personal portfolios. Any site where the author is technical and the content is text-heavy.

#### 3. MDX (Markdown + JSX components)

MDX extends markdown with the ability to import and use React (or other framework) components inline. The file is `.mdx` instead of `.md`.

```mdx
---
title: "Interactive Demo Post"
date: 2026-04-07
---

Here is normal markdown text.

But I can also drop in a **live component**:

import { InteractiveChart } from '../../components/Chart';

<InteractiveChart data={[1, 4, 2, 8, 5]} />

And then continue writing in markdown.
```

Astro supports MDX natively via `@astrojs/mdx` integration. MDX files work with Content Collections the same way `.md` files do — same schema validation, same type safety, same queries.

**What it enables as a business capability:**
- **Interactive content.** Blog posts can contain live demos, interactive charts, embedded code playgrounds, custom callout boxes, animated diagrams — anything a React component can render. This is what separates a *developer blog* from a *developer publication*.
- **Content as product.** Courses (interactive exercises in lessons), documentation (live API explorers), technical blogs (runnable code examples) — MDX is the foundation. Sites like Josh Comeau's blog, Kent C. Dodds' courses, and Stripe's docs use this pattern.
- **Component reuse.** Define a `<Callout>` component once, use it in every post. Consistent design without copy-pasting HTML. Design system meets content.

**Trade-offs:**
- Content is no longer pure markdown — it has JavaScript imports and JSX. Less portable (not every system understands MDX). If you move to a non-JS platform, MDX files need conversion.
- Mixing content and code in the same file blurs the boundary. A broken component import breaks the blog post build.
- Heavier builds — MDX files are compiled through a JS pipeline, not just parsed as text.
- Overkill if your posts are just text with headings and code blocks. The complexity exists whether you use components or not.
- Slightly steeper learning curve — you need to understand JSX imports, component props, and how the MDX compiler works.

**Who uses this:** Developer educators (Josh Comeau, Kent C. Dodds), technical documentation with live examples (Storybook, Chakra UI), interactive course platforms, any content site where posts need to do more than display text.

#### 4. Headless CMS (Contentful, Sanity, Strapi, Hygraph, Payload)

Content lives in an external platform with its own database, admin UI, and API. Your site fetches content from that API at build time (or runtime) and renders it.

```
Author writes in CMS admin panel → Content stored in CMS database → 
Build triggers API fetch → Framework renders to HTML → Deploy
```

The "headless" part means: the CMS has no frontend — it only provides content via API. You build the frontend yourself (in Astro, Next.js, whatever). Compare to "traditional CMS" (WordPress) where the CMS IS the frontend.

**Major players and what they're good at:**

| CMS | Model | Sweet spot |
|---|---|---|
| **Contentful** | SaaS, structured content | Enterprise content operations. Strong content modeling, localization. |
| **Sanity** | SaaS, real-time collaboration | Custom editing experiences (Sanity Studio is fully customizable React). Real-time preview. |
| **Strapi** | Open-source, self-hosted | Full control. Own your data. REST + GraphQL APIs. |
| **Hygraph** (ex-GraphCMS) | SaaS, GraphQL-native | Content federation — pull from multiple sources. |
| **Payload** | Open-source, code-first | Developer-centric. Schema defined in TypeScript. Closest to "headless CMS for developers." |

**What it enables as a business capability:**
- **Non-technical content teams.** The entire reason headless CMS exists: editors, marketers, and writers author content in a visual interface without touching code. This unlocks content operations at scale — editorial calendars, approval workflows, scheduled publishing, role-based permissions.
- **Multi-channel delivery.** Same content, delivered via website, mobile app, email newsletter, in-app notifications, digital signage, and — critically — APIs for AI agents. Write once, publish everywhere. The content is decoupled from any single presentation.
- **Structured content as a business asset.** A headless CMS forces content modeling: defining content types, fields, relationships, and validation rules. This turns content from "pages" into a structured, queryable, reusable dataset. E-commerce (product catalog), media (articles + authors + categories), SaaS (help docs + changelog + marketing) — all content-driven businesses depend on this.
- **Localization / i18n.** Most headless CMS platforms have built-in support for multiple languages — a hard requirement for any product serving international markets.
- **Preview and editorial workflow.** Draft → Review → Publish pipelines. Content preview before going live. Scheduled publishing. Version history and rollback. These workflows are what allow a 50-person content team to operate without stepping on each other.

**Trade-offs:**
- External dependency. The CMS is a service you don't control — pricing changes, API changes, downtime.
- Cost at scale. Free tiers exist (Contentful: 25K records, Sanity: 100K API requests/month) but content-heavy sites or high-traffic sites hit paid tiers quickly. Enterprise plans run $300-2,000+/month.
- Added complexity. Content fetch at build time adds a network dependency. Webhook-triggered rebuilds add infrastructure. Local development needs mocked data or API access.
- Content-code separation can become a pain: the CMS schema and the frontend components must stay in sync manually.
- Overkill for a single-author site with infrequent updates. All the workflow, permissions, and multi-channel machinery serves no purpose.

**Who uses this:** Marketing sites for mid-to-large companies (content teams publish independently of engineering), e-commerce (product catalogs), media/publishing, documentation platforms, any product where non-developers need to create and manage content.

#### 5. Git-based CMS (TinaCMS, Decap/Netlify CMS, Forestry → now Tina)

A visual editing interface that reads from and commits to your git repository. The content still lives as markdown files in your repo, but you get a web-based editor with a rich-text toolbar, media management, and preview — all backed by git commits.

```
Author edits in visual web UI → CMS commits .md file to git repo → 
CI/CD rebuilds site → Deploy
```

**What it enables as a business capability:**
- **Best of both worlds.** Git is the source of truth (version history, branching, portability), but the authoring experience is visual. Non-technical collaborators can contribute without learning markdown or git.
- **Real-time visual editing.** TinaCMS in particular offers in-context editing: you see the actual rendered page and edit inline. This is as close to "WYSIWYG for static sites" as it gets.
- **No vendor lock-in on content.** Because the content is still markdown in git, you can remove the CMS layer at any time and keep editing files directly. The CMS is a convenience layer, not a dependency.

**Trade-offs:**
- Another service/dependency to set up and maintain (TinaCMS has a cloud service; Decap needs an identity/auth provider).
- The visual editor's capabilities are limited by what the underlying format supports. Markdown has no concept of columns, cards, or complex layouts — so the editor can't create them.
- Adds complexity for a single technical author who's comfortable in VS Code. The visual editor solves a problem you don't have.
- Smaller ecosystems — TinaCMS and Decap are niche tools compared to the headless CMS players.

**Who uses this:** Small agency sites where clients need to edit content. Open-source documentation projects where non-technical contributors need a low-barrier editing path. Small business sites maintained by the business owner.

#### 6. Full platform CMS (WordPress, Ghost, Medium)

The CMS IS the product. Content lives in the platform's database, the platform renders the frontend, handles hosting, and provides the entire publishing workflow.

| Platform | Model | Sweet spot |
|---|---|---|
| **WordPress** | Open-source (self-hosted or wordpress.com) | 43% of the web. Plugin ecosystem for anything. Themes for any design. |
| **Ghost** | Open-source (self-hosted or Ghost Pro) | Modern blogging + newsletters + memberships. Clean, fast, focused. |
| **Medium** | SaaS platform | Zero setup. Built-in audience. But no customization, you don't own the platform. |

**What it enables as a business capability:**
- **Publishing as a product immediately.** Ghost in particular enables a paid newsletter/membership business out of the box: Stripe integration, subscriber management, email delivery, content paywalling. This is a complete content business platform.
- **WordPress's plugin ecosystem** enables essentially any web product: e-commerce (WooCommerce), LMS (LearnDash), forums (bbPress), membership sites, job boards, directories. 43% of websites run WordPress — it IS the web for non-technical businesses.
- **Zero-to-published in minutes.** No build pipeline, no deployment, no infrastructure. The value proposition is speed to market for content.

**Trade-offs:**
- You're running a server (WordPress/Ghost self-hosted) or paying for hosting (WordPress.com, Ghost Pro — $9-25+/month).
- Performance overhead — dynamic rendering, database queries, plugin bloat (WordPress especially). Opposite of SSG's "pre-built HTML on CDN."
- Security surface area — WordPress is the #1 target for web attacks precisely because it's 43% of the web. Constant updates, plugin vulnerabilities, brute-force login attempts.
- Vendor lock-in (Medium especially — you don't own the URL, the design, or the distribution algorithm).
- Completely misaligned with the learning goals of this project. You learn WordPress/Ghost/Medium — not web fundamentals, not AWS, not frontend architecture.

**Who uses this:** Most of the web. Small businesses, bloggers, publishers, e-commerce stores, news sites, agencies. Anyone who values speed to market and ecosystem over architectural control and learning.

### How this maps to your project

| Option | Fits NFR-7? | Fits single author? | Supports v2/v3 avatar? | Learning value |
|---|---|---|---|---|
| Raw HTML | ✅ source files | ✅ | ❌ unstructured | ❌ anti-pattern |
| **Markdown in git** | ✅ single commit | ✅ perfect | ✅ structured frontmatter | ✅ content-as-data pattern |
| **MDX** | ✅ single commit | ✅ | ✅ structured | ✅ interactive content |
| Headless CMS | ❌ external system | ⚠️ overkill | ✅ API-native | ✅ but wrong context |
| Git-based CMS | ✅ git-backed | ⚠️ unnecessary | ✅ structured | ⚠️ solves a problem you don't have |
| Full platform CMS | ❌ external system | ✅ | ⚠️ varies | ❌ wrong learning path |

The realistic choice is between **Markdown** and **MDX**. Everything else is either eliminated by NFR-7 or adds complexity for capabilities you don't need.

**Markdown vs MDX — the actual decision:**

- **Markdown** is simpler. Posts are pure text. Portable everywhere. If your blog posts are writing + code blocks + images (which FR-4 specifies), markdown does everything you need.
- **MDX** adds the ability to embed React components inside posts. Interesting if you want interactive demos in blog posts (e.g., a live chart showing a concept, an interactive code playground). But it adds build complexity, reduces portability, and you need to know enough React to write those components first.

With Astro Content Collections, you can start with `.md` and switch individual posts to `.mdx` later without any migration — they coexist in the same collection. This is not a one-way door.

### Discussion

The landscape here is broad, but the decision for your project is narrow. The more interesting takeaway is understanding **when and why** you'd reach for the other options in future projects:

- Building a product where non-technical people create content → **headless CMS**
- Building a content business (paid newsletter, membership) → **Ghost**
- Building an agency site for a client who needs to edit → **git-based CMS**
- Building interactive educational content → **MDX**
- Building a developer blog/portfolio → **Markdown in git**

### Decision

**Chosen:** Markdown in git, powered by Astro Content Collections

**Why:** The project is a single-author, text-heavy content site where the author is technical and comfortable with git. Markdown files in the repository, processed by Astro Content Collections, satisfy every constraint: NFR-7 (publish in a single commit), FR-4 (headings, code blocks, images, links), and the v2/v3 avatar's need for structured, parseable content. There is no editorial team, no content workflow, no multi-channel delivery need — so every CMS option (headless, git-based, or full platform) adds complexity for capabilities that don't apply.

The content pipeline is: write `.md` in VS Code → `git commit && git push` → CI/CD rebuilds site → live. No external dependencies, no hosting cost for the content layer, no vendor lock-in.

**MDX is deferred, not rejected.** Astro Content Collections accept `.md` and `.mdx` files side by side — no migration needed. When a specific blog post needs an interactive component (live demo, interactive chart), that single file gets renamed to `.mdx` and the component is imported. This is a per-post decision, not a project-wide one.

**Bilingual (Czech + English) is a known future path.** Markdown in git is the friendliest format for adding i18n later — parallel folder structure (`en/`, `cs/`) plus Astro's built-in i18n routing. No migration, no CMS reconfiguration. Not a v1 scope item.

**What it enables for future projects (what you learned):**
- **Content as data** — the mental model of structured frontmatter + body as a queryable dataset is the foundation of every content-driven product: blogs, docs, knowledge bases, course platforms, e-commerce catalogs. The pattern (define schema → validate → query → render) transfers to any framework and any scale.
- **Git as CMS** — version history, branching (draft on a branch, merge to publish), diffs, rollback — all free. This workflow scales to open-source documentation projects with hundreds of contributors.
- **Headless CMS landscape** — understanding when and why to reach for Contentful, Sanity, or Strapi is senior architect knowledge. The answer is: when non-technical people need to create content, when content serves multiple channels, or when editorial workflows matter. Not for a solo developer's blog.
- **Content portability** — markdown is universal. The content written for this project moves to any future platform (Next.js, Hugo, Ghost import) without conversion.

**What was traded away:**
- No visual editing experience — writing happens in a code editor, not a rich-text WYSIWYG. This is a feature for a developer, but would be a blocker for a non-technical author.
- No built-in editorial workflow (draft/review/publish states, scheduled publishing). Git branches approximate this, but it's manual.
- Images require manual handling — save file, reference path, ensure optimization. No drag-and-drop, no automatic resizing (unless tooling is added in DP-9).
- No interactive content in blog posts at launch. Deferred to per-post MDX adoption when the need arises and React skills are stronger.

---

## DP-5: Styling Approach

How does the site go from "HTML structure" to "something that looks good"? Styling is where design meets code. The choice here determines how fast you can build a visually consistent site, what design skills you develop, and how maintainable the visual layer is as the site grows. It also determines how much of the design work you do yourself versus how much you delegate to a pre-built system.

### Constraints from BRD/PRD

- Clean, non-distracting design — "personality without visual noise; calm, focused, easy to read" (BRD).
- Good typography for blog reading (US-3, AC-3.2 — legible on desktop and mobile).
- Responsive/mobile-first — must work on phone, tablet, desktop (FR-8, US-7). Mobile is the primary arrival context (US-5 — scanning at an event on a phone).
- Fast mobile load (NFR-1) — CSS approach affects bundle size.
- Browser support: latest 2 versions of Chrome, Firefox, Safari, Edge including mobile (NFR-3).
- Astro framework (DP-2) — supports scoped CSS natively, plus any CSS framework.
- Learning goal: understand how styling works on the web, not just "it looks right."

### Options considered

#### 1. Plain CSS (vanilla, no framework)

Write `.css` files directly. Use modern CSS features: custom properties (variables), flexbox, grid, media queries, container queries, `:has()`, nesting (now natively supported).

```css
/* styles/global.css */
:root {
  --color-text: #1a1a1a;
  --color-accent: #2563eb;
  --max-width: 65ch;
}

.post {
  max-width: var(--max-width);
  margin: 0 auto;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .post { padding: 1rem; }
}
```

Astro has built-in scoped CSS — styles in a `<style>` tag inside an `.astro` file are automatically scoped to that component (no class name collisions).

**What it enables as a business capability:**
- **Complete design freedom.** No grid system, no predefined spacing scale, no opinionated defaults to override. Every pixel is intentional. This is how design agencies and brands with strong visual identities work — their sites don't look like any framework.
- **Zero dependency, zero build cost.** No npm package, no build plugin, no version upgrades. The CSS you write IS the CSS the browser runs.
- **Foundational skill.** Every other styling approach on this list is an abstraction over CSS. Understanding CSS deeply — the cascade, specificity, box model, layout algorithms (flexbox, grid), responsive design — makes you effective in ANY styling approach. It's the "learn the language, not the library" equivalent for visual design.

**Trade-offs:**
- Slower to build. No pre-built components, no utility shortcuts. You design and code every button, card, header, and layout from scratch.
- Consistency is manual. You have to maintain your own spacing scale, color palette, typography system, and responsive breakpoints. Design systems emerge from discipline, not tooling.
- Naming is a problem at scale. Without a methodology (BEM, SMACSS), class names collide, styles leak, and refactoring becomes risky. Astro's scoped CSS mitigates this per-component but doesn't solve global styles.
- Responsive design requires writing every media query by hand.

**Who uses this:** Design agencies with strong brands, sites with unique visual identities (Apple, Stripe), developers who want maximum control, educational contexts where learning CSS fundamentals is the goal.

#### 2. Tailwind CSS (utility-first)

Instead of writing CSS in separate files, you apply small single-purpose utility classes directly in HTML. Each class does one thing: `text-lg` (font size), `p-4` (padding), `bg-blue-500` (background color), `md:grid-cols-2` (2-column grid on medium screens).

```astro
<article class="max-w-prose mx-auto px-4 md:px-0">
  <h1 class="text-3xl font-bold mb-4">{post.data.title}</h1>
  <p class="text-gray-600 text-sm">{post.data.date}</p>
  <div class="prose prose-lg">
    <slot />
  </div>
</article>
```

Tailwind scans your files at build time and generates only the CSS for classes you actually use — resulting in tiny CSS bundles (typically 5-15KB gzipped).

**What it enables as a business capability:**
- **Speed of development.** Once you know the utility classes, you style without switching between HTML and CSS files. No naming decisions, no file organization, no cascade management. This is why startups and product teams adopt Tailwind — it's the fastest path from "idea" to "styled UI."
- **Built-in design system.** Tailwind's default configuration IS a design system: a curated spacing scale (4, 8, 12, 16...), a color palette, a typography scale, breakpoints. You get visual consistency without designing the system yourself. The constraints are the feature.
- **Responsive design as prefix.** `md:`, `lg:`, `hover:`, `dark:` — responsive and interactive styles are just class prefixes, not separate media query blocks. This makes responsive development dramatically faster.
- **The `@tailwindcss/typography` plugin** (called "Prose") provides beautiful default styling for markdown-rendered HTML — exactly what a blog needs. One class (`prose`) gives you well-designed headings, paragraphs, code blocks, lists, blockquotes, links — all typographically sound. This directly addresses AC-3.2 (legible typography).
- **Industry standard.** Tailwind is the dominant styling approach in the modern frontend ecosystem. Most open-source Astro templates, Next.js starters, and component libraries use it. Knowing Tailwind is a practical career skill.

**Trade-offs:**
- HTML becomes verbose. A styled component can have 20+ classes on one element. Readability suffers, especially for developers unfamiliar with the utility names.
- You're learning Tailwind's vocabulary, not CSS directly. `p-4` is `padding: 1rem`, but you think in Tailwind tokens, not CSS properties. If you switch to a non-Tailwind project, you need to translate.
- Customization beyond the default system requires editing `tailwind.config.js`. It's possible (and well-documented) but it's configuration, not code.
- The abstraction can mask understanding. You can build a responsive layout with `flex md:grid md:grid-cols-2 gap-4` without understanding how flexbox or grid actually work. For learning, this is a cost.
- Adds a build dependency — Tailwind's JIT compiler must process your files.

**Who uses this:** The majority of modern frontend projects. Startups (speed), product teams (consistency), open-source projects (contributor accessibility), indie developers (one-person-does-everything). Vercel's own site, Tailwind UI, most Y Combinator company sites.

#### 3. CSS-in-JS (styled-components, Emotion, vanilla-extract, Panda CSS)

Write CSS using JavaScript — either as tagged template literals, object notation, or type-safe functions. Styles are colocated with the component that uses them.

```tsx
// styled-components style
const PostTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

// vanilla-extract style (generates CSS at build time)
export const postTitle = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
});
```

**What it enables as a business capability:**
- **Component-scoped styles with full JS power.** Dynamic styling based on props, theme switching, computed values — CSS becomes programmable. This is the foundation of sophisticated design systems (Material UI, Chakra UI) where components adapt to context.
- **Type-safe styling** (vanilla-extract, Panda CSS). TypeScript catches invalid CSS values at build time. Useful for large teams where style consistency is enforced by tooling.
- **Theme systems.** Dark mode, brand themes, white-label products — CSS-in-JS makes theme switching a first-class feature through context/providers.

**Trade-offs:**
- Runtime cost. Most CSS-in-JS libraries (styled-components, Emotion) inject styles at runtime in the browser — adding JavaScript weight and slowing initial render. This directly conflicts with NFR-1 (fast mobile load).
- Build-time alternatives (vanilla-extract, Panda CSS) fix the runtime problem but add build complexity and are less widely adopted.
- Tied to the React ecosystem. CSS-in-JS doesn't work in `.astro` files — only in React island components. For a mostly-Astro site, you'd have two styling systems (CSS-in-JS for islands, something else for Astro pages).
- Steeper learning curve. You need to understand JavaScript AND CSS AND the library's API.
- Not the direction the industry is moving — even Meta deprecated their internal CSS-in-JS (StyleX notwithstanding). Tailwind and CSS Modules are winning mindshare.

**Who uses this:** Large React applications with complex design systems (MUI-based dashboards, Chakra UI apps), white-label SaaS products, applications where theme switching is a core feature. Declining in new projects.

#### 4. Component libraries (shadcn/ui, DaisyUI, Radix, Chakra UI)

Pre-built, pre-styled UI components. Instead of designing a button, you import `<Button>`. Instead of building a navigation menu, you import `<NavigationMenu>`.

| Library | How it works | Philosophy |
|---|---|---|
| **shadcn/ui** | Copy-paste React components into your project. Tailwind + Radix under the hood. You own the code — no npm dependency. | "Not a component library — a collection of reusable components you can copy and customize." |
| **DaisyUI** | Tailwind plugin that adds semantic class names (`btn`, `card`, `navbar`). No JS, pure CSS components. | Tailwind shortcuts — faster prototyping. |
| **Radix UI** | Unstyled, accessible React primitives (dialogs, dropdowns, tabs). You add your own styles. | Accessibility-first building blocks. |
| **Chakra UI** | Styled React components with theme system. CSS-in-JS under the hood (Emotion). | Full design system, ready to use. |
| **Material UI (MUI)** | Google's Material Design as React components. Largest component library. | Enterprise-grade, opinionated design language. |

**What it enables as a business capability:**
- **Speed to production UI.** A full navigation bar, modal dialogs, dropdown menus, form inputs — all accessible, responsive, and cross-browser tested — without designing or building them. This is how product teams ship fast: use components for standard patterns, custom-build only what's unique.
- **Accessibility by default.** Radix, shadcn/ui, Chakra, and MUI handle keyboard navigation, ARIA attributes, focus management, and screen reader support. Accessibility is hard to do right from scratch — component libraries encode that knowledge.
- **Design consistency at scale.** When a 10-person team all uses the same Button, Card, and Layout components, the product looks consistent without a design police force.

**Trade-offs:**
- Most are React-only (shadcn/ui, Chakra, MUI, Radix). They work in island components but not in `.astro` files — you'd need React for everything that uses the library, which pushes you toward a React-heavy architecture.
- DaisyUI works with Astro (it's just CSS classes) but gives you less — no interactive components (modals, dropdowns), just visual styling.
- Pre-built components teach you to assemble, not to build. You learn the library's API, not how buttons, modals, and navigation actually work in HTML/CSS.
- Visual identity becomes constrained by the library's design language. A shadcn/ui site looks like a shadcn/ui site. A MUI site looks like Google. Standing out requires significant customization — often harder than building from scratch.
- Bundle size — full component libraries add significant JavaScript weight.

**Who uses this:** SaaS dashboards, internal tools, admin panels, any product where "looking like a well-built app" matters more than "looking unique." Startups that need to ship a product UI fast. Less common for personal sites where visual identity matters.

#### 5. CSS Modules

Standard CSS files where class names are locally scoped by the build tool. You write regular CSS, but import it as a JavaScript object — each class name is automatically made unique.

```css
/* Post.module.css */
.title {
  font-size: 2rem;
  font-weight: bold;
}
```

```tsx
import styles from './Post.module.css';
<h1 className={styles.title}>...</h1>
```

**What it enables as a business capability:**
- **CSS without naming collisions.** You get the full power of CSS with guaranteed isolation per component. No BEM naming conventions needed.
- **Zero runtime cost.** CSS Modules produce regular `.css` files at build time. No JavaScript overhead.
- **Framework-agnostic.** Works in React, Astro, Vue, Svelte — any build tool supports it.

**Trade-offs:**
- You still write all the CSS yourself — no design system, no utility shortcuts.
- Responsive design is still manual media queries.
- Less widely adopted than Tailwind in the Astro/React ecosystem — fewer examples and templates to learn from.
- The module import pattern adds a small indirection (`styles.title` instead of `class="title"`).

**Who uses this:** Next.js projects (it's a built-in feature), teams that want CSS isolation without adopting Tailwind or CSS-in-JS. A middle ground between plain CSS and utility frameworks.

### How this maps to your project

| Approach | Design freedom | Dev speed | Learning value | Mobile perf | Blog typography | Fits Astro? |
|---|---|---|---|---|---|---|
| Plain CSS | ✅ total | ❌ slow | ✅ fundamentals | ✅ zero overhead | ⚠️ manual | ✅ native |
| **Tailwind CSS** | ⚠️ within system | ✅ fast | ⚠️ Tailwind, not CSS | ✅ tiny bundle | ✅ `prose` plugin | ✅ first-class |
| CSS-in-JS | ✅ high | ⚠️ moderate | ⚠️ React-specific | ❌ runtime cost | ⚠️ manual | ❌ islands only |
| Component library | ❌ constrained | ✅ fastest | ❌ assembly, not building | ⚠️ bundle size | ⚠️ varies | ⚠️ React islands only |
| CSS Modules | ✅ total | ⚠️ moderate | ✅ real CSS | ✅ zero overhead | ⚠️ manual | ✅ supported |

CSS-in-JS and full component libraries are poor fits — they're React-centric, add runtime or bundle weight, and don't align with a content-first Astro site.

The realistic choice is between three approaches:

**Plain CSS** — maximum learning, maximum control, slowest development. You build the design system yourself: typography scale, spacing, colors, responsive breakpoints. Every media query, every layout, every component styled from scratch. You'll deeply understand CSS, but it takes significantly longer.

**Tailwind CSS** — fast development, built-in design system, blog typography solved by `prose`. The most pragmatic choice. But you learn Tailwind's abstractions rather than raw CSS — `gap-4` instead of `gap: 1rem`. The question is whether that trade-off matters for your learning goals.

**Plain CSS + Tailwind hybrid** — use Astro's scoped `<style>` blocks for learning CSS fundamentals on key components (layout, navigation, hero) while using Tailwind utilities for rapid styling of repetitive patterns (spacing, responsive adjustments, typography). This gives you CSS knowledge AND development speed, but two mental models in the same project can be confusing.

### Discussion

The tension here is **learning depth vs. development speed**:

- If the goal is to deeply understand CSS and web design: **plain CSS**. You'll be slower, but everything you build is knowledge that transfers everywhere. You'll understand WHY Tailwind's utilities work, not just how to use them.
- If the goal is to ship a good-looking site and learn styling pragmatically: **Tailwind**. The `prose` plugin alone saves hours of blog typography work. The utility system teaches you design thinking (spacing scales, color systems) even if it abstracts the CSS syntax.
- If you want both: start with Tailwind (ship faster) and know that you can always write plain CSS inside Astro's `<style>` blocks for any component where you want to learn the fundamentals hands-on.

One more consideration: **Tailwind is AI-friendly.** Because styles are inline in the HTML, an AI coding assistant (Claude, Copilot) can see and modify the full styling context in a single file. With plain CSS, the styling is in a separate file — the AI needs to read both. For your agentic-design-aware workflow, this is a practical advantage.

### Decision

**Chosen:** Tailwind CSS (with Astro's scoped `<style>` blocks available for plain CSS when desired)

**Why:** The priority is shipping a good-looking site, not mastering CSS right now. Tailwind provides a built-in design system (spacing, colors, typography, breakpoints) that produces a visually consistent site without designing the system from scratch. The `@tailwindcss/typography` (`prose`) plugin directly solves blog typography (AC-3.2) — legible headings, paragraphs, code blocks, lists, and links on desktop and mobile with a single class. Responsive design is fast via prefix utilities (`md:`, `lg:`), which addresses FR-8 and the mobile-first arrival context (US-5, US-7). CSS bundle stays tiny (Tailwind's JIT generates only used utilities).

Astro's scoped `<style>` blocks are always available — for any component where you want to learn raw CSS, you can write plain CSS without any conflict. Tailwind and scoped CSS coexist naturally in Astro. This keeps the door open for deeper CSS learning on a per-component basis without committing to it project-wide.

Tailwind is also AI-friendly: styles are inline in the HTML, so Claude or any AI assistant can see structure + styling in a single file — no context-switching between HTML and CSS files.

**What it enables for future projects (what you learned):**
- **Design system thinking.** Tailwind's constrained scales (spacing, color, typography) teach the discipline of designing within a system — the same discipline that design tokens, brand guidelines, and component libraries enforce at larger companies. You'll understand why `p-4` exists (consistency) and when to break from the system (custom brand expression).
- **Utility-first as industry standard.** Tailwind is the dominant styling approach in modern frontend. Knowing it transfers directly to any Astro, Next.js, or React project. Most open-source templates and component libraries (shadcn/ui, DaisyUI) are built on Tailwind.
- **Responsive design patterns.** Mobile-first responsive design via breakpoint prefixes builds the mental model of how layouts adapt — even though the syntax is Tailwind-specific, the underlying CSS concepts (media queries, flexbox, grid) are universal.
- **The `prose` pattern.** Understanding how a typography plugin styles arbitrary HTML (markdown-rendered content) is directly applicable to any content-driven product.

**What was traded away:**
- Not learning raw CSS deeply in v1. The risk: you'll know `flex gap-4` but not `display: flex; gap: 1rem`. Mitigated by Astro's scoped CSS escape hatch and by the fact that Tailwind utilities map 1:1 to CSS properties — the translation is mechanical, not conceptual.
- HTML verbosity — styled elements carry long class strings. Readable once you learn the vocabulary, noisy before that.
- Build dependency — Tailwind's compiler must process files. Minor, but it's not zero-config like plain CSS.
- Visual identity is influenced by Tailwind's defaults. A Tailwind site with default config looks like other Tailwind sites. Custom configuration and intentional design choices counteract this.

---

## DP-6: Hosting / Infrastructure

Where does the built site live, and how does it get served to visitors? This is where the "cloud" part of web development begins. For a static site, hosting is simple — put files on a server, point a domain at it. But the landscape of HOW you do that ranges from "click a button, done" to "configure IAM policies, S3 bucket policies, CloudFront distributions, Origin Access Identity, SSL certificates, and DNS records." The choice determines what you learn, what you pay, and how much infrastructure you can evolve into.

### Constraints from BRD/PRD

- Fast global load, especially mobile (NFR-1, US-5) — CDN delivery essential.
- v1 is static files (HTML/CSS/JS). No server-side logic, no database.
- v2 needs API routes (Lambda or equivalent) for the avatar API.
- v3 needs server-side AI logic (LLM integration via Bedrock or external API).
- The stack must support API routes, capability discovery, and eventually server-side AI logic (BRD future direction).
- AWS is an explicit learning goal — understanding real cloud infrastructure (DP-2 cost analysis already explored this).
- Astro + SST is the deployment chain (from DP-2 decision — `new sst.aws.Astro("Site")` handles S3, CloudFront, Lambda).
- Cost should be near-zero for v1 traffic volumes.

### Options considered

#### 1. GitHub Pages

GitHub serves static files directly from a repository. Push to a branch → site is live. Zero configuration.

**How it works:** GitHub runs a build (optional — can serve pre-built files), deploys to GitHub's CDN. Free custom domain support with HTTPS. Tightly integrated with GitHub Actions for CI/CD.

**What it enables as a business capability:**
- **Zero-ops publishing.** The simplest path from code to live site. No hosting account, no configuration, no billing. This is how open-source project documentation works (React docs, Vue docs, thousands of libraries).
- **Free for public repos.** No cost, ever, for static sites under GitHub's generous limits (100GB bandwidth/month, 1GB storage).

**Trade-offs:**
- Static files only — no server-side logic, no API routes, no Lambda. v2/v3 would require a completely separate hosting solution for the API.
- No CDN configuration control — you get GitHub's CDN, not a CDN you configure (no cache rules, no edge functions, no custom headers).
- Limited build — Jekyll is native; Astro requires a GitHub Actions workflow to build first.
- No AWS learning. You learn nothing about cloud infrastructure.
- Tied to GitHub — if you move repos, you move hosting.

**Who uses this:** Open-source documentation, developer portfolios, project landing pages, static blogs. Anyone who wants free, zero-config static hosting.

**v1 cost:** Free. **v2/v3 cost:** Not possible — need a separate solution.

#### 2. Netlify

A platform-as-a-service for web projects. Git push triggers build → deploy → global CDN. Includes serverless functions, form handling, identity/auth, edge functions, and preview deploys.

**How it works:** Connect a git repo, configure the build command (`astro build`), Netlify does the rest — builds, deploys to its CDN, provisions HTTPS, handles custom domains. Serverless functions (Netlify Functions) run on AWS Lambda under the hood but are fully abstracted.

**What it enables as a business capability:**
- **Full web project lifecycle in one platform.** Build, deploy, serverless backend, form handling, auth, A/B testing, analytics — all integrated. This is the "don't think about infrastructure" model. Teams ship features, Netlify handles ops.
- **Preview deploys.** Every pull request gets its own URL — reviewers see the actual built site, not just code. This is a powerful workflow feature for teams.
- **Edge functions** for personalization, A/B testing, geo-routing — without managing infrastructure.

**Trade-offs:**
- Abstraction hides the infrastructure. You don't learn what S3, CloudFront, or Lambda are — you learn Netlify's abstractions for those things. If you leave Netlify, the knowledge doesn't transfer to AWS, GCP, or Azure.
- Free tier is generous (100GB bandwidth, 300 build minutes/month) but paid tiers jump to $19/month/member. Enterprise features (SSO, audit logs) are expensive.
- Vendor lock-in on serverless functions — Netlify Functions have a Netlify-specific API. Moving to raw Lambda requires rewriting.
- Less control over caching, headers, and CDN behavior than self-managed CloudFront.

**Who uses this:** Frontend teams and agencies, JAMstack projects, marketing sites, documentation, indie SaaS landing pages. The default choice for developers who want to focus on code, not infrastructure.

**v1 cost:** Free. **v2 cost:** Free tier likely covers it. **v3 cost:** Depends on function usage.

#### 3. Vercel

The company behind Next.js. Similar to Netlify but more tightly integrated with the React/Next.js ecosystem. Git push → build → deploy → global edge network.

**How it works:** Same model as Netlify — connect repo, configure build, auto-deploy. Vercel's edge network is built on AWS and Cloudflare. First-class support for Next.js, but also supports Astro, SvelteKit, Nuxt, and plain static sites.

**What it enables as a business capability:**
- Everything Netlify enables, plus **edge-first architecture.** Vercel Edge Functions run in Cloudflare's network — faster cold starts than Lambda, closer to users.
- **Best-in-class DX (developer experience).** Instant previews, automatic HTTPS, analytics, speed insights, image optimization, cron jobs.
- **Next.js alignment.** If you ever migrate to Next.js (DP-2 noted this as a future option), Vercel is its native home.

**Trade-offs:**
- Same abstraction problem as Netlify — you learn Vercel, not cloud infrastructure.
- Pricing can spike. The hobby tier is free, but the Pro tier ($20/month) kicks in quickly for teams. Bandwidth overages and function invocations can produce surprise bills.
- Even more Next.js-centric than it claims. Astro works, but the ecosystem, docs, and tooling prioritize Next.js.
- Vendor lock-in — Vercel-specific features (Edge Config, KV, Blob storage) tie you to their platform.

**Who uses this:** Next.js projects (overwhelming majority), React teams, frontend startups, indie developers. The default for the React ecosystem.

**v1 cost:** Free. **v2 cost:** Free tier likely covers it. **v3 cost:** Depends on function usage.

#### 4. Cloudflare Pages + Workers

Cloudflare — primarily a CDN/security company — offers static hosting (Pages) and serverless functions (Workers) running at 300+ edge locations worldwide.

**How it works:** Git push → build → deploy to Cloudflare's edge network. Workers run JavaScript/WASM at the edge with extremely fast cold starts (<5ms vs Lambda's 100-500ms). D1 (SQLite at the edge), KV (key-value store), R2 (S3-compatible object storage) provide data layers.

**What it enables as a business capability:**
- **Edge computing, properly.** Workers run at 300+ locations — not "a few regions" like Lambda. For latency-sensitive applications (real-time APIs, personalization, geo-aware content), this is the gold standard.
- **Full-stack at the edge.** Pages (static) + Workers (compute) + D1 (database) + R2 (storage) + KV (cache) = a complete platform that runs at the edge. This is a distinct architectural model from AWS's region-centric approach.
- **Cheapest at scale.** Workers are priced per request (first 100K/day free, then $0.50 per million). No duration billing. For high-traffic, low-compute workloads, significantly cheaper than Lambda.

**Trade-offs:**
- Edge runtime constraints — Workers have limited CPU time (10-50ms on free plan), limited memory, no native Node.js (uses V8 isolates, not Node). Complex v3 logic (LLM orchestration) may not fit.
- You learn Cloudflare's platform, not AWS. The edge computing knowledge transfers conceptually but not practically to AWS.
- Smaller ecosystem than AWS. Fewer tutorials, fewer integrations, smaller community.
- D1 and R2 are newer, less battle-tested than AWS's equivalents (RDS, S3).
- No direct path to Bedrock (AWS's AI service) — v3 would need external API calls to Anthropic/OpenAI instead of native AWS integration.

**Who uses this:** Performance-obsessed sites, edge-first applications, high-traffic static sites, API gateways, sites that need global low-latency. Growing fast among indie developers.

**v1 cost:** Free. **v2 cost:** Free tier covers it. **v3 cost:** Workers + external LLM API.

#### 5. AWS S3 + CloudFront (manual setup)

Build the infrastructure yourself using AWS's building blocks: S3 for file storage, CloudFront for CDN, Route 53 for DNS, ACM for SSL certificates, IAM for permissions.

**How it works:** You configure each service individually through the AWS Console or CLI:
1. Create an S3 bucket, upload built files.
2. Create a CloudFront distribution pointing to the S3 bucket.
3. Configure Origin Access Identity (OAI) so CloudFront can read from the private S3 bucket.
4. Request an SSL certificate from ACM.
5. Configure Route 53 DNS records to point your domain to CloudFront.
6. Set up IAM policies for deployment permissions.

Each step involves understanding a distinct AWS service, its configuration, its pricing model, and how it interacts with the others.

**What it enables as a business capability:**
- **Real cloud infrastructure knowledge.** You understand what every managed platform (Netlify, Vercel, Cloudflare) is abstracting away. This knowledge transfers to ANY cloud project — not just websites but SaaS backends, data pipelines, ML deployments. It's the difference between knowing how to drive and knowing how the engine works.
- **Full control.** Custom cache policies (what to cache, for how long, cache invalidation on deploy), custom error pages, geographic restrictions, request/response manipulation via CloudFront Functions, custom headers (security, CORS), logging to S3 or CloudWatch.
- **v2/v3 evolution on the same platform.** Add Lambda behind API Gateway for avatar API → add Bedrock for AI → add DynamoDB for state → add SQS for async processing. All within the same AWS account, same IAM, same billing, same mental model. No platform migration between v1 and v3.
- **Industry-standard skill.** AWS is 31% of cloud market share (Azure 25%, GCP 11%). AWS experience is the most portable cloud skill in the job market. IAM, S3, CloudFront, Lambda, API Gateway — these are the building blocks of most production web infrastructure.

**Trade-offs:**
- Significantly more setup time than any managed platform. What Netlify does in one click takes hours of AWS Console configuration (or IaC setup).
- IAM is notoriously complex — misconfigured permissions are the #1 cause of AWS security incidents and the #1 source of developer frustration.
- More operational responsibility — you manage cache invalidation, monitor errors, handle SSL certificate renewal (ACM auto-renews, but you configure it).
- Cost tracking requires attention — AWS's pay-per-use model means you need to understand what each service charges for. No "free plan with limits" — it's free tier with a 12-month expiration on some services.
- Overkill for a static personal site in isolation. The value is entirely in what you learn, not what you need.

**Who uses this:** Production web applications at companies of all sizes, SaaS products, media sites, e-commerce. Anyone running web infrastructure at scale on AWS. This is NOT typically how personal blogs are hosted — unless learning AWS is the point.

**v1 cost:** ~$0.50-1/month (mostly Route 53). **v2 cost:** ~$1-2/month (Lambda + API Gateway free tier). **v3 cost:** LLM tokens + Lambda.

#### 6. AWS S3 + CloudFront via SST (Infrastructure as Code)

Same AWS services as option 5, but configured and deployed using **SST (Serverless Stack)** — a framework that defines infrastructure in TypeScript code instead of clicking through the AWS Console.

```typescript
// sst.config.ts
new sst.aws.Astro("Site", {
  domain: "jirkasindelar.com"
});
```

That single line creates: S3 bucket, CloudFront distribution, OAI, SSL certificate, DNS records, and deploys the built Astro site. Under the hood, SST generates AWS CloudFormation templates.

**How it works:** SST uses TypeScript to define infrastructure. `sst deploy` provisions all AWS resources. `sst dev` runs a local development environment connected to real AWS services. `sst remove` tears it all down. Infrastructure changes are version-controlled in git alongside application code.

**What it enables as a business capability:**
- **Everything from option 5, with dramatically less friction.** Same AWS services, same knowledge, same control — but configured in code, not through a console. Infrastructure becomes version-controlled, reviewable, and reproducible.
- **Infrastructure as Code (IaC) skills.** The practice of defining infrastructure in code (not clicking UIs) is a fundamental DevOps/cloud skill. SST teaches IaC principles that transfer to Terraform, Pulumi, CDK, and CloudFormation.
- **Progressive complexity.** Start with `new sst.aws.Astro()` and add complexity as needed:
  ```typescript
  // v2: Add API for avatar
  const api = new sst.aws.ApiGatewayV2("AvatarApi");
  api.route("GET /api/avatar", "src/api/avatar.handler");
  
  // v3: Add AI integration
  new sst.aws.Function("AvatarChat", {
    handler: "src/api/chat.handler",
    permissions: ["bedrock:InvokeModel"]
  });
  ```
- **First-class Astro support.** SST's Astro component handles the static-to-serverless transition automatically. Static pages go to S3+CloudFront; API routes become Lambda functions. Same `sst deploy` command.
- **Team-ready.** Multiple environments (dev, staging, prod) from the same config. Each developer can spin up their own isolated AWS stack with `sst dev --stage personal`.

**Trade-offs:**
- Adds SST as a dependency between you and AWS. SST abstracts CloudFormation — if SST has a bug or doesn't support a specific AWS feature, you need to drop to raw CloudFormation or CDK constructs.
- Less "hands-on" with AWS than manual setup. You understand WHAT gets created (S3, CloudFront, Lambda) but not the exact configuration steps. The deep IAM/console knowledge from option 5 is partially abstracted.
- SST is a smaller project than Terraform or CDK — risk of project abandonment or breaking changes (SST v2→v3 was a significant rewrite). However, it generates standard CloudFormation — if SST disappears, the infrastructure still works.
- Learning SST's API on top of AWS concepts is another layer of abstraction to internalize.

**Who uses this:** Serverless-first teams on AWS, indie developers who want AWS power without AWS console pain, startups building on Lambda/API Gateway/DynamoDB. Growing adoption in the Astro/Next.js community.

**v1 cost:** Same as option 5 (~$0.50-1/month). **v2/v3 cost:** Same. SST itself is free and open-source.

#### 7. AWS Amplify

AWS's own managed hosting platform — their answer to Netlify/Vercel. Git push → build → deploy → CloudFront CDN. Includes hosting, auth (Cognito), API (AppSync/GraphQL), storage, and more.

**How it works:** Connect a git repo in the Amplify Console, configure build settings, Amplify handles deployment to CloudFront. Also offers a CLI and libraries for adding backend features (auth, API, storage) with minimal configuration.

**What it enables as a business capability:**
- **AWS-managed platform experience.** Simpler than raw S3+CloudFront, but still AWS — your resources are in your AWS account, visible in the console, and you learn AWS concepts (CloudFront, S3, IAM) through a gentler interface.
- **Backend features built in.** Auth (Cognito), GraphQL API (AppSync), REST API (API Gateway + Lambda), file storage (S3) — all provisioned through Amplify's abstractions. Could serve the v2 avatar API.

**Trade-offs:**
- Amplify's abstractions are opinionated and sometimes limiting. When you outgrow them, migrating to raw AWS services is harder than starting there.
- The Amplify Console and CLI are separate products with separate docs — confusing.
- Less community momentum than SST. Amplify Gen 2 (code-first, TypeScript) is recent and the ecosystem is still maturing.
- You learn Amplify's abstractions, not AWS primitives. The gap between "I used Amplify" and "I understand AWS infrastructure" is larger than the gap between "I used SST" and the same.
- Build times can be slow. Amplify's build pipeline adds overhead compared to SST's direct deployment.

**Who uses this:** Mobile app backends (Amplify's original focus), simple web apps that need auth + API quickly, AWS customers who want a managed experience without learning raw services.

**v1 cost:** Free tier (12 months: 5GB storage, 15GB bandwidth). After: ~$0.01-0.02/GB served. **v2/v3 cost:** Depends on backend usage.

#### 8. Traditional server (VPS / EC2 / DigitalOcean / Railway / Fly.io)

Run your own server — either a virtual machine (EC2, DigitalOcean Droplet) or a container platform (Railway, Fly.io). You install Node.js, Nginx, or whatever you need, and manage the server yourself.

**What it enables as a business capability:**
- **Full server control.** Run anything — any language, any framework, any database, any background process. No serverless constraints, no edge runtime limits. This is how most of the internet still works.
- **Server administration skills.** SSH, Nginx, firewalls, SSL, process management, log rotation, backups — the foundational ops skills that platform-as-a-service abstracts away.
- **Fixed-cost pricing.** A $5/month DigitalOcean droplet or a Railway hobby plan has predictable cost regardless of traffic (within limits). No per-request billing surprises.

**Trade-offs:**
- Massively overkill for a static site. You're managing a server to serve files that S3+CloudFront handles without a server at all.
- No CDN by default — you'd need to add CloudFront or Cloudflare in front. Otherwise, visitors far from the server region get slow loads.
- Security responsibility — you patch the OS, update packages, configure firewalls, monitor for intrusion. A misconfigured server is an open target.
- Server cost runs whether or not anyone visits the site. Serverless (Lambda) costs $0 when idle.
- Doesn't align with the serverless/edge architecture chosen in DP-1 (Hybrid/Islands).

**Who uses this:** Full-stack applications that need long-running processes, WebSocket connections, or specific system-level requirements. Legacy applications. Developers who want full control and understand server administration. Not for static content sites.

**v1 cost:** $5-10/month minimum. **v2/v3 cost:** Same server, but need to scale if traffic grows.

### How this maps to your project

| Option | v1 (static) | v2 (API) | v3 (AI) | AWS learning | Setup effort | Cost |
|---|---|---|---|---|---|---|
| GitHub Pages | ✅ | ❌ separate | ❌ separate | ❌ none | ✅ trivial | Free |
| Netlify | ✅ | ✅ functions | ⚠️ limited | ❌ none | ✅ easy | Free→$19 |
| Vercel | ✅ | ✅ functions | ⚠️ limited | ❌ none | ✅ easy | Free→$20 |
| Cloudflare Pages | ✅ | ✅ Workers | ⚠️ edge limits | ❌ none | ✅ easy | Free |
| AWS manual | ✅ | ✅ Lambda | ✅ Bedrock | ✅ deep | ❌ hard | ~$0.50/mo |
| **AWS via SST** | ✅ | ✅ Lambda | ✅ Bedrock | ✅ solid | ⚠️ medium | ~$0.50/mo |
| AWS Amplify | ✅ | ✅ built-in | ⚠️ abstracted | ⚠️ partial | ⚠️ medium | Free tier |
| VPS/EC2 | ✅ overkill | ✅ | ✅ | ⚠️ EC2 only | ❌ hard | $5-10/mo |

The managed platforms (Netlify, Vercel, Cloudflare) are eliminated by the learning goal — they're the fastest path to "site is live" but the slowest path to "I understand cloud infrastructure."

GitHub Pages is eliminated by the v2/v3 evolution — no API routes.

VPS is eliminated by the architecture — serverless/static doesn't need a running server.

That leaves three AWS paths: **manual**, **SST**, and **Amplify**.

**Manual vs SST — the real tension:**

- **Manual setup** teaches you AWS the hard way — every console screen, every IAM policy, every configuration option. You understand exactly what exists and why. But it's slow, error-prone, and not reproducible. Your "infrastructure" is a series of manual steps that can't be version-controlled.
- **SST** teaches you AWS through code — you understand what resources exist (S3, CloudFront, Lambda) and how they connect, but the exact configuration is handled by SST. It's faster, reproducible, version-controlled, and aligns with how production infrastructure is actually managed (IaC). But you skip the console-level detail.
- **Amplify** is the middle ground nobody loves — more AWS-aware than Netlify, but more abstracted than SST. It teaches you Amplify's model, not AWS's model.

The DP-2 decision already chose SST as the deployment tool (`new sst.aws.Astro("Site")`). The question is whether that remains the right call or whether manual setup first (then SST later) would build deeper understanding.

### Discussion

### Decision

**Chosen:** AWS S3 + CloudFront (manual setup for v1), transitioning to SST (Infrastructure as Code) for v2+

**Why:** The two-phase approach gives the best learning arc. v1 is deliberately built by hand — configuring S3, CloudFront, Route 53, ACM, and IAM through the AWS Console — so the foundational cloud concepts are understood at the lowest level before any abstraction is introduced. When v2 adds API routes (Lambda, API Gateway) and the infrastructure becomes more complex, SST takes over — same AWS services, but defined in TypeScript, version-controlled, and reproducible. By that point, you'll understand exactly what SST is abstracting and why IaC exists.

This mirrors how cloud knowledge is actually built in the industry: ops engineers learn the console/CLI first, then adopt IaC (Terraform, CDK, SST) once they understand what the code is describing. Starting with IaC skips the "why" — you know that `new sst.aws.Astro()` creates an S3 bucket and CloudFront distribution, but not what those things are, how they're configured, or what the IAM policies actually permit.

**v1 manual setup scope:**
1. S3 bucket — static file hosting, bucket policy for CloudFront access.
2. CloudFront distribution — CDN, custom domain, HTTPS, cache behavior, Origin Access Identity.
3. Route 53 — DNS hosted zone, A record (alias to CloudFront).
4. ACM — SSL/TLS certificate for HTTPS (must be in us-east-1 for CloudFront).
5. IAM — deployment user with least-privilege permissions for uploading to S3 and invalidating CloudFront cache.

**v2 transition to SST:**
When API routes are needed for the avatar, the manual infrastructure is replaced by SST's `sst.config.ts`. The manual setup knowledge means you can read SST's generated CloudFormation and understand every resource. SST's first-class Astro support (`new sst.aws.Astro("Site")`) handles the static-to-serverless transition — static pages to S3+CloudFront, API routes to Lambda — from a single config.

**What it enables for future projects (what you learned):**
- **AWS fundamentals from first principles.** S3, CloudFront, Route 53, ACM, IAM — the five services that underpin most web hosting on AWS. Understanding them at the console level means you can debug, optimize, and reason about any AWS-hosted web application, regardless of what IaC tool manages it.
- **IAM mental model.** AWS permissions are the hardest and most important part of AWS. Configuring IAM policies by hand — understanding principals, actions, resources, and conditions — builds the security foundation for every future AWS project. This is the skill that separates "I deployed something on AWS" from "I understand AWS."
- **Infrastructure as Code motivation.** After manually configuring 5 services with 15+ configuration screens, the value of `sst deploy` becomes visceral, not theoretical. You'll adopt IaC because you understand the pain it solves, not because someone told you to.
- **The manual-to-IaC transition pattern.** This is exactly how production teams evolve — start manual or with ClickOps, hit the reproducibility wall, adopt IaC. Having lived both sides makes you effective at introducing IaC to teams that haven't made the transition yet.

**What was traded away:**
- Slower v1 deployment. What SST does in one command will take hours of console work. This is intentional — the time is the learning.
- Manual infrastructure is not reproducible. If the S3 bucket or CloudFront distribution is misconfigured, debugging is console archaeology. No git history for infrastructure changes until SST is adopted.
- The v1→v2 transition involves replacing manual infrastructure with IaC — a small migration effort. Mitigated by the fact that SST can create new resources alongside (or replacing) the manual ones.
- Risk of configuration drift in v1 — manual changes are easy to forget. Documenting the setup steps (in an infrastructure runbook or the SDD) mitigates this.

---

## DP-7: Domain

What URL do visitors type — or see in a shared link? The domain is the site's identity on the internet. It's the first thing visitors see before any content loads, and it shapes trust, memorability, and brand perception. For the digital avatar vision, the domain is also the agent-discoverable address — the place other agents connect to.

### Constraints from BRD/PRD

- Brand and credibility matter — "establishes Jirka Sindelar's brand and credibility as a software engineer" (BRD north star).
- Two audiences: tech industry peers (met at events) and recruiters. Both judge professionalism partly by URL.
- Shareable — links pasted into Slack, LinkedIn, email should look clean and trustworthy (FR-10, US-9).
- Route 53 is the DNS provider (from DP-6 — manual AWS setup).
- Bilingual (Czech + English) is a future consideration — domain choice may affect this.
- Cost should be reasonable for a personal project.

### The two-part question

**Part A: Custom domain or hosting subdomain?**
**Part B: If custom, which TLD and registrar?**

### Part A: Custom domain vs. subdomain

| Option | Example | Cost | Credibility |
|---|---|---|---|
| **Custom domain** | `jirkasindelar.com` | ~$10-15/year | ✅ Professional, memorable, permanent |
| CloudFront subdomain | `d1234abcd.cloudfront.net` | Free | ❌ Looks temporary, untrustworthy |
| S3 website URL | `mybucket.s3-website.eu-central-1.amazonaws.com` | Free | ❌ Looks like infrastructure, not a person |

This isn't a real decision — a personal brand site without a custom domain signals "I didn't care enough to spend $12." For a site whose BRD north star is credibility, a custom domain is mandatory.

### Part B: TLD (Top-Level Domain)

The TLD is the part after the dot. It carries meaning — both to humans scanning a URL and to the overall impression of the site.

| TLD | Example | Cost/year | Signal | Notes |
|---|---|---|---|---|
| **`.com`** | `jirkasindelar.com` | ~$10-12 | Universal, default, trusted. The "safe" choice. | Most recognized globally. Everyone assumes `.com` first. |
| **`.dev`** | `jirkasindelar.dev` | ~$12-14 | "I'm a developer." Technical identity signal. | Google-owned, HTTPS enforced. Popular with developers. |
| **`.io`** | `jirkasindelar.io` | ~$30-40 | Tech/startup culture. | More expensive. Originally British Indian Ocean Territory — some ethical concerns about the domain's colonial origin. |
| **`.cz`** | `jirkasindelar.cz` | ~$10-15 | Czech identity. | Signals Czech Republic. Good if audience is Czech, limiting if international. Relevant for bilingual future (Czech site on `.cz`, English on `.com`). |
| **`.me`** | `jirkasindelar.me` | ~$15-20 | Personal. "This is me." | Less common, slightly playful. Originally Montenegro. |
| **`.site`** | `jirkasindelar.site` | ~$3-5 | Generic, cheap. | Low trust signal. Often associated with spam/throwaway sites. |
| **`.engineer`** | `jirka.engineer` | ~$25-35 | Novelty, very specific. | Memorable but unusual. Not everyone recognizes newer TLDs. |

**What the TLD enables as a mental model:**
- **`.com`** is the default internet. If you tell someone your URL verbally at a conference, they'll assume `.com` unless you specify. It's the lowest-friction option for sharing.
- **`.dev`** is an identity statement. It says "I build software" before the page even loads. It's become the de facto TLD for developer portfolios and tools. HTTPS-only enforcement (built into the TLD) is a minor security bonus.
- **`.cz`** is a geographic identity. It's interesting for the bilingual future — a common pattern is `.com` for English and `.cz` for Czech, both pointing to the same site with language detection or a language switcher. It also signals "based in Czech Republic" which can be relevant for local recruiters.
- **Multiple domains** are possible and cheap. You can register `jirkasindelar.com` AND `jirkasindelar.dev` AND `jirkasindelar.cz`, point them all to the same CloudFront distribution, and use one as the canonical. This is common practice — it prevents others from squatting your name on other TLDs.

### Domain name itself

The name `jirkasindelar` is long (14 characters). Options to consider:

| Name | Domain | Pros | Cons |
|---|---|---|---|
| `jirkasindelar` | `jirkasindelar.com` | Full name, unambiguous, professional | Long to type, no special characters for háček |
| `jsindelar` | `jsindelar.com` | Shorter, initial + surname pattern | Less personal, common pattern |
| `sindelar` | `sindelar.dev` | Short, surname-focused | Likely taken for common TLDs. Less personal. |
| `jirka` | `jirka.dev` | Short, memorable, first-name identity | Common Czech name, likely taken for `.com`. Works better with `.dev` or `.engineer`. |
| Custom word | `buildwithjirka.com` | Creative, brandable | Doesn't age well, harder to remember |

The full name (`jirkasindelar`) is the safest choice for a personal brand — it's unambiguous, it's you, and it's unlikely to be taken across multiple TLDs. Shorter variations are worth checking for availability.

### Registrar

Where you buy and manage the domain. The registrar matters for pricing, renewal rates, DNS management, and whether they try to upsell you on everything.

| Registrar | Registration | Renewal | DNS included | Notes |
|---|---|---|---|---|
| **Route 53 (AWS)** | ~$12-14 (.com) | Same | ✅ integrated | Buy domain where your DNS already lives. One fewer account. Slightly more expensive than cheapest options. |
| **Cloudflare Registrar** | At-cost (~$10 .com) | Same (at-cost) | ✅ excellent | Cheapest legitimate registrar — they charge wholesale price, no markup. But your DNS would be on Cloudflare, not Route 53. |
| **Namecheap** | ~$9-10 (.com) | ~$13-15 | Basic | Popular, cheap first year. Renewal is higher. DNS is basic — you'd still use Route 53 for DNS. |
| **Google Domains** | Shut down, migrated to Squarespace Domains | — | — | No longer available. |
| **GoDaddy** | ~$12 (first year deals) | ~$20+ | Basic | Aggressive upselling, higher renewals, dark patterns in UI. Avoid. |
| **Porkbun** | ~$10 (.com) | ~$10 | Good | Developer-friendly, transparent pricing, good UI. |

**The practical choice is between Route 53 and an external registrar:**

- **Route 53 as registrar:** Domain + DNS in one place. No nameserver configuration needed — the domain is automatically linked to your Route 53 hosted zone. Slightly more expensive but eliminates a setup step and an external account. Aligned with the "learn AWS" goal from DP-6.
- **External registrar (Cloudflare, Porkbun) + Route 53 DNS:** Cheaper domain registration. But you need to configure the external registrar's nameservers to point to Route 53 — an extra step that's straightforward but adds a moving part.

### Discussion

This one is less architectural and more practical. The key questions:

1. **Which TLD?** `.com` (universal) vs. `.dev` (developer identity) is the main tension. Both are good. `.cz` as an additional domain for the bilingual future is worth considering but not urgent.
2. **Which registrar?** Route 53 (all-AWS, simpler) vs. external (cheaper, extra setup step).
3. **Is the domain available?** This may resolve the decision — check `jirkasindelar.com`, `jirkasindelar.dev`, and any variations before choosing.

### Decision

**Chosen:** `jirkasindelar.dev` registered via Route 53 (fallback: `.com` if unavailable)

**Why:** `.dev` signals developer identity before the page loads — it fits the personal brand of a software engineer and the digital avatar vision. Route 53 as registrar keeps domain + DNS in one AWS account, eliminating an external dependency and an extra nameserver configuration step. This aligns with the DP-6 decision to learn AWS manually — domain registration in Route 53 is one of the setup steps.

Cost is ~$12-14/year for the domain + $0.50/month for the Route 53 hosted zone. The biggest fixed cost of the entire project.

If `jirkasindelar.dev` is unavailable, `jirkasindelar.com` is the fallback — universally recognized, no explanation needed. Availability will be checked during the DP-6 AWS setup.

**Future option:** Register additional TLDs (`.com`, `.cz`) later to prevent name squatting and to support the bilingual future (`.cz` for Czech content). Not a v1 priority — one domain is enough to launch.

**What was traded away:**
- `.com`'s universal recognition — visitors may need to hear "dot dev" explicitly when the URL is shared verbally. Minor friction.
- Cheaper registrar options (Cloudflare at-cost, Porkbun) — paying a few dollars more per year to keep everything in AWS. Worth it for simplicity.

---

## DP-8: Analytics

How do you know if the site is working? The BRD defines three KPIs — return-visitor ratio, average session duration, and unique visitors per month. Measuring them requires analytics. But the PRD also sets hard privacy constraints: no third-party ad trackers (NFR-4), no cookie banner (NFR-5), no personal data collection (NFR-6). These constraints eliminate most of the analytics industry and narrow the field significantly.

### Constraints from BRD/PRD

- **Three KPIs to measure:**
  1. Return-visitor ratio — % of visitors who come back (primary KPI, retention signal)
  2. Average session duration — proxy for content engagement
  3. Unique visitors per month — top-of-funnel reach
- **NFR-4:** No third-party ad or tracking scripts (no Google Analytics ads features, no Facebook Pixel)
- **NFR-5:** No GDPR cookie consent banner required — means no cookies that require consent, or cookieless analytics
- **NFR-6:** No personal data collection — aggregate, anonymized only
- **FR-9:** Lightweight analytics sufficient for the three KPIs
- Traffic arrives via referral (LinkedIn, GitHub, direct shares), not SEO — so search-focused analytics features are less relevant

### Options considered

#### 1. Google Analytics (GA4)

The industry default. Free, powerful, used by ~55% of all websites. Tracks everything: page views, sessions, users, events, conversions, demographics, referral sources, real-time data.

**What it enables as a business capability:**
- **Full marketing analytics stack.** Funnel analysis, audience segmentation, campaign attribution, e-commerce tracking, A/B test integration. This is what marketing teams, product managers, and growth teams use daily.
- **Google ecosystem integration.** Connects to Google Ads, Search Console, BigQuery, Looker Studio. If you're running paid campaigns, GA4 is the analytics layer.
- **Free at any scale.** No traffic limits on the free tier. Paid tier (GA360) is for enterprises needing data guarantees and SLAs.

**Trade-offs:**
- ❌ **Fails NFR-4, NFR-5, and NFR-6.** GA4 sets cookies, collects personal data (IP addresses, device fingerprints), and requires a GDPR consent banner in the EU. This alone eliminates it.
- Google uses the data for its own ad targeting. Your visitors' behavior feeds Google's advertising machine.
- Heavy script (~45KB) that slows page load.
- Complex — the GA4 interface is notoriously difficult to navigate. Overkill for three simple KPIs.

**Who uses this:** Most commercial websites, marketing-driven businesses, e-commerce, anyone running Google Ads. The default choice when privacy isn't a hard constraint.

#### 2. Plausible Analytics

Privacy-first, open-source web analytics. No cookies, no personal data, GDPR/CCPA/PECR compliant by design. One-line script (~1KB).

**How it works:** A lightweight script tracks page views and basic metrics without cookies or personal identifiers. Visitors are counted using a hash of the day + website + IP address + user agent — the hash rotates daily, so no visitor can be tracked across days. Return visitors are estimated, not tracked persistently.

**What it enables as a business capability:**
- **Privacy-compliant analytics without a cookie banner.** This is Plausible's entire value proposition. You get the essential metrics — visitors, page views, referral sources, session duration, bounce rate, browser/OS/device — without any consent mechanism. Legal in the EU without a banner.
- **Simple dashboard.** One page, all metrics visible. No configuration needed. The opposite of GA4's complexity.
- **Referral source tracking.** You can see if visitors came from LinkedIn, GitHub, direct, or a shared link — directly relevant for understanding how the BRD's referral-traffic assumption plays out.

**Trade-offs:**
- Paid SaaS: **€9/month** (10K page views) for cloud-hosted. This is the biggest cost item in the entire project — more than hosting.
- Self-hosted option exists (free, open-source) but requires a server — contradicts the serverless architecture from DP-1/DP-6.
- Return-visitor ratio is **estimated, not precise.** Because there are no persistent cookies, Plausible can't definitively say "this visitor was here before." It uses heuristics. For the primary KPI, this is a limitation.
- No event tracking in the free/basic tier — custom events (button clicks, scroll depth, PDF downloads) require paid features or manual setup.

**Who uses this:** Privacy-conscious businesses, EU companies that don't want cookie banners, developer blogs, indie projects, anyone who wants simple analytics without the Google ecosystem.

#### 3. Simple Analytics

Similar to Plausible — privacy-first, no cookies, GDPR compliant. Dutch company with a strong privacy stance.

**What it enables:** Same as Plausible — basic web metrics without privacy compromise. Slightly different dashboard design.

**Trade-offs:**
- Paid: **$9/month** (100K page views). Similar pricing to Plausible.
- Less open-source community than Plausible (code is public but license is restrictive).
- Smaller ecosystem and fewer integrations.

**Who uses this:** Similar audience to Plausible. European companies especially.

#### 4. Umami

Open-source, self-hosted web analytics. Privacy-focused, no cookies, GDPR compliant. Free forever if you host it yourself.

**How it works:** A Node.js application with a PostgreSQL or MySQL database. You deploy it on a server or managed platform, add a tracking script to your site, and view metrics in Umami's dashboard.

**What it enables as a business capability:**
- **Free, privacy-compliant analytics.** All the benefits of Plausible without the monthly cost. The trade-off is hosting and maintaining the analytics server yourself.
- **Full data ownership.** Analytics data lives in your database, not a third party's. You can query it directly, export it, build custom reports.
- **Custom events.** Track specific interactions (button clicks, PDF downloads, scroll depth) for free — no paid tier.

**Trade-offs:**
- **Requires a server.** Umami needs a running Node.js process + database. This contradicts the serverless architecture — you'd need a separate hosting solution (Railway, Fly.io, a small VPS, or Vercel/Netlify free tier for Umami specifically).
- Operational burden — you maintain the analytics server, handle updates, ensure uptime, manage the database.
- More setup effort than a SaaS solution.

**Who uses this:** Developers who want free, self-hosted analytics and don't mind the ops overhead. Open-source projects. Personal sites where the $9/month for Plausible feels excessive.

#### 5. CloudFront + CloudWatch (AWS-native)

Use AWS's own logging and monitoring — CloudFront access logs stored in S3, analyzed via CloudWatch or Athena.

**How it works:** CloudFront can log every request to an S3 bucket. Each log entry includes: timestamp, edge location, bytes served, HTTP status, referrer, user agent, URI. You query these logs with Athena (SQL on S3) or process them with Lambda.

**What it enables as a business capability:**
- **Zero additional cost** (CloudFront logs are free; Athena charges ~$5/TB scanned, which is negligible at personal site volumes).
- **Raw data, full control.** You have the actual server logs — the most granular data source possible. Build exactly the reports you need.
- **AWS learning.** S3 → Athena → CloudWatch dashboards is a real-world data pipeline pattern used in production.

**Trade-offs:**
- **No client-side analytics.** CloudFront logs show HTTP requests, not user behavior. You can't measure session duration (how long someone read a blog post), scroll depth, or JavaScript events. A visitor who opens a page and reads for 10 minutes looks identical to a bot that hit the URL and left.
- **Return-visitor tracking is crude.** Without cookies or JavaScript, you can only approximate return visitors by IP + user agent — unreliable with mobile networks and shared IPs.
- **Significant build effort.** You'd need to build the analytics pipeline: log parsing, aggregation, dashboard. This is a project in itself.
- **No real-time dashboard.** Logs are batched (typically hourly). No live visitor count.
- Doesn't directly satisfy FR-9 — the three KPIs require client-side signal that server logs can't provide (especially session duration and return visits).

**Who uses this:** DevOps teams monitoring infrastructure, not product analytics. Useful as a complement to client-side analytics for traffic volume and error monitoring.

#### 6. Fathom Analytics

Privacy-first analytics, similar to Plausible and Simple Analytics. Canadian company, EU-isolated data processing.

**Trade-offs:**
- Paid: **$15/month** (100K page views). More expensive than Plausible/Simple Analytics.
- Polished product but less open-source community.
- Same capability class as Plausible — the premium is for the brand and support, not additional features.

#### 7. No analytics (defer)

Launch without analytics. Add it later when you have content worth measuring.

**The case for deferring:**
- Analytics is a M3 milestone item (Polish phase) — not needed for M1 (Skeleton) or M2 (Content).
- The three KPIs only become meaningful after launch (M4) when real traffic arrives. Before that, you're measuring your own test visits.
- Adding a script tag later is a one-line change. There's no architecture to set up in advance.

**The case against:**
- You lose baseline data from launch day. The first visitors (shared via LinkedIn, GitHub) are often the most interesting — you want to see where they came from and what they looked at.
- It's a small task — one script tag and a dashboard. Deferring it saves almost no time.

### How this maps to your project

| Option | NFR-4 (no trackers) | NFR-5 (no cookie banner) | NFR-6 (no PII) | 3 KPIs | Cost | Setup effort |
|---|---|---|---|---|---|---|
| Google Analytics | ❌ | ❌ | ❌ | ✅ all three | Free | Easy |
| **Plausible** | ✅ | ✅ | ✅ | ⚠️ return visits estimated | €9/mo | Trivial |
| Simple Analytics | ✅ | ✅ | ✅ | ⚠️ return visits estimated | $9/mo | Trivial |
| **Umami (self-hosted)** | ✅ | ✅ | ✅ | ⚠️ return visits estimated | Free | Medium (needs server) |
| CloudFront logs | ✅ | ✅ | ✅ | ❌ no session duration | Free | High (build pipeline) |
| Fathom | ✅ | ✅ | ✅ | ⚠️ return visits estimated | $15/mo | Trivial |
| Defer | ✅ | ✅ | ✅ | ❌ none | Free | None |

Google Analytics is eliminated by NFR-4/5/6. CloudFront logs can't measure session duration or return visits reliably. The realistic choices are:

- **Plausible (cloud)** — €9/month, zero setup, best dashboard, but it's the most expensive line item in the project.
- **Umami (self-hosted)** — free, but needs a server you don't otherwise have. Could run on Vercel/Railway free tier — ironic to use a platform you rejected for hosting, but practical for a side-service.
- **Defer** — add analytics at M3/M4 when it matters. No data loss that's meaningful before launch.

### Discussion

**The honest tension:** All privacy-compliant analytics tools share the same limitation for your primary KPI — **return-visitor ratio is estimated, not precise**, because persistent tracking is exactly what privacy compliance prevents. No cookieless solution can definitively say "this visitor was here 3 weeks ago." They all use daily-rotating heuristics.

This means the primary KPI will always be approximate. That's fine for a personal site — you're looking for directional signal ("are people coming back?"), not precise percentages.

### Decision

**Chosen:** Deferred — add Umami (self-hosted) or Plausible at M3/M4

**Why:** Analytics is a M3 milestone item and the three KPIs only become meaningful after launch when real traffic arrives. Adding a tracking script is a one-line change — there's no architecture to design upfront. Deferring costs nothing and avoids a recurring expense (Plausible €9/mo) or an unnecessary server (Umami) during the build phase.

When analytics is needed (M3/M4), the preferred direction is **Umami (self-hosted)** — free, privacy-compliant, no cookie banner, full data ownership. It can run on a free tier of Railway, Vercel, or Fly.io alongside the AWS-hosted site. If the self-hosting overhead isn't worth it at that point, **Plausible cloud** (€9/mo) is the one-command alternative.

**What it enables for future projects (what you learned):**
- **Privacy-compliant analytics landscape.** Understanding the trade-offs between Google Analytics (powerful but privacy-hostile), privacy-first SaaS (Plausible, Simple Analytics, Fathom — paid but zero-setup), and self-hosted (Umami — free but ops overhead) is directly applicable to any product that serves EU users or values privacy.
- **The cookieless estimation trade-off.** All privacy-compliant tools estimate return visitors rather than tracking them precisely. Understanding this limitation — and that directional signal is sufficient for most non-enterprise use cases — is an important product analytics insight.
- **CloudFront logs as a complementary data source.** Server-side logs (from DP-6's CloudFront setup) can supplement client-side analytics for traffic volume, error rates, and geographic distribution — a common production monitoring pattern.

**What was traded away:**
- No analytics data from day one. The first visitors after launch won't be measured if analytics isn't added by M4. Mitigated by the fact that meaningful traffic starts at M4 (public announcement), and analytics can be added in the M3 polish phase just before.
- Self-hosted Umami requires maintaining a small server — a minor ongoing responsibility that doesn't exist with Plausible's SaaS model.

---

## DP-9: CI/CD Pipeline

How does code go from "committed" to "live on the internet"? CI/CD (Continuous Integration / Continuous Deployment) is the automation between pushing code and visitors seeing the result. For v1 with manual AWS setup (DP-6), the pipeline is: build Astro → upload HTML/CSS/JS to S3 → invalidate CloudFront cache. The question is whether that happens manually (run commands yourself), semi-automatically (a script you trigger), or fully automatically (push to git → site updates).

### Constraints from prior decisions

- Astro (DP-2) — `astro build` produces a `dist/` folder of static files.
- Manual AWS for v1 (DP-6) — S3 bucket + CloudFront distribution configured by hand. Deployment means: upload files to S3, invalidate CloudFront cache.
- SST for v2 (DP-6) — `sst deploy` handles everything. The CI/CD pipeline would run `sst deploy` instead of manual S3 upload.
- Source hosting (DP-10) — not decided yet, but likely GitHub (the industry default for open-source and personal projects). CI/CD choice may depend on this.
- Single developer — no pull request reviews, no branch protection, no multi-environment complexity in v1.

### Options considered

#### 1. Manual deploy (CLI commands)

You run the deploy commands yourself from your terminal:

```bash
astro build
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

**What it enables as a business capability:**
- **Nothing beyond what it is.** Manual deploy is the absence of automation. It's how you start — run the commands, see what happens, understand the pipeline before automating it.
- **Learning the deploy steps.** Before automating something, you should understand what it does. Running `aws s3 sync` and `aws cloudfront create-invalidation` teaches you what deployment actually means for a static site on AWS.

**Trade-offs:**
- Error-prone — forget a step, typo a bucket name, deploy from the wrong branch.
- Slow — 3-4 commands every time you want to publish. Friction that reduces publishing frequency.
- No audit trail — you don't know what was deployed when, or from which commit.
- Doesn't scale — fine for one person publishing occasionally, painful for frequent updates.

**Who uses this:** The first deploy of any project. Prototypes. Scripts that haven't been automated yet.

#### 2. Shell script (local automation)

Wrap the manual commands in a script:

```bash
#!/bin/bash
# deploy.sh
set -e
echo "Building..."
astro build
echo "Uploading to S3..."
aws s3 sync dist/ s3://your-bucket --delete
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
echo "Done!"
```

Run `./deploy.sh` from your terminal. One command instead of three.

**What it enables:**
- Reproducible deploy — same steps every time, no forgotten commands.
- Still local — you control when deploys happen. Push to git for version control, deploy when ready.

**Trade-offs:**
- Still manual — you have to remember to run it.
- Runs on your machine — depends on your local AWS credentials, your Node.js version, your environment. "Works on my machine" problem.
- No connection to git — you can deploy uncommitted or unpushed code. The live site can diverge from the repository.

**Who uses this:** Solo developers, small projects, early-stage startups. A pragmatic middle ground before full CI/CD.

#### 3. GitHub Actions

GitHub's built-in CI/CD platform. Define workflows in YAML files (`.github/workflows/deploy.yml`) that run automatically on git events (push, pull request, schedule).

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      - run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

Push to `main` → GitHub builds → uploads to S3 → invalidates cache → site is live. Fully automatic.

**What it enables as a business capability:**
- **Automated deployment pipeline.** The fundamental CI/CD value proposition: every push to main is automatically built, tested (if tests exist), and deployed. No manual steps, no forgotten commands, no "works on my machine."
- **Git as the source of truth.** What's on `main` IS what's live. No divergence between code and deployment. Every deploy is traceable to a commit.
- **Pull request checks.** Even as a solo developer, GitHub Actions can build pull request branches and report success/failure — catching build errors before they reach main.
- **Secrets management.** AWS credentials stored as GitHub Secrets, not in your local environment or committed to code. Secure by default.
- **Free for public repos.** 2,000 minutes/month for private repos on the free tier. A static site build takes ~1-2 minutes — you'd need 1,000+ deploys/month to hit the limit.
- **Industry standard.** GitHub Actions is the dominant CI/CD platform for open-source and small-to-medium teams. Understanding YAML workflows, job runners, secrets, and trigger events transfers to any project on GitHub.

**Trade-offs:**
- YAML configuration — workflows are defined in YAML, which can be verbose and finicky (indentation matters, debugging is slow — push, wait for runner, read logs, fix, repeat).
- GitHub lock-in — workflows are GitHub-specific. Moving to GitLab or Bitbucket means rewriting in their CI syntax (though concepts transfer).
- Runner cold start — each run provisions a fresh VM (~20-30 seconds overhead). Not a problem for deploy pipelines, but noticeable for quick tasks.
- Requires GitHub as source host (DP-10). If you choose GitLab, this option doesn't apply.

**Who uses this:** Most open-source projects, most small-to-medium teams on GitHub, indie developers, startups. The default CI/CD choice for the GitHub ecosystem.

#### 4. GitLab CI/CD

GitLab's built-in CI/CD. Similar concept to GitHub Actions — YAML pipelines triggered by git events. Tightly integrated with GitLab's merge requests, environments, and registry.

**What it enables:**
- Same as GitHub Actions — automated build/test/deploy pipelines.
- Stronger built-in environment management (staging, production, review apps).
- Better container registry integration (build and push Docker images natively).

**Trade-offs:**
- Requires GitLab as source host. If you choose GitHub (DP-10), this doesn't apply.
- YAML syntax is different from GitHub Actions — skills don't transfer 1:1.
- Free tier: 400 CI/CD minutes/month (less generous than GitHub's 2,000).
- Smaller ecosystem of reusable actions/templates compared to GitHub Actions marketplace.

**Who uses this:** Teams on GitLab, enterprise organizations (GitLab is strong in enterprise DevOps), European companies (GitLab is a Dutch company with EU data hosting).

#### 5. AWS CodePipeline + CodeBuild

AWS's native CI/CD. Define a pipeline that watches a source (GitHub, S3, CodeCommit), runs a build (CodeBuild), and deploys (S3, CloudFormation, ECS, Lambda).

**What it enables as a business capability:**
- **All-AWS pipeline.** Source → Build → Deploy entirely within AWS. No external CI/CD dependency. IAM controls access at every step.
- **AWS learning.** Understanding CodePipeline, CodeBuild, and their IAM roles adds to the DP-6 AWS knowledge. This is how enterprise AWS shops run CI/CD.
- **Integration with AWS deployment targets.** Native support for deploying to S3, CloudFormation (SST), ECS, Lambda — no third-party actions needed.

**Trade-offs:**
- More complex setup than GitHub Actions. CodePipeline, CodeBuild, and their IAM roles each need configuration. The AWS Console UI for CodePipeline is clunky.
- Less community and fewer examples than GitHub Actions. Debugging is harder — logs are in CloudWatch, not inline.
- Cost: CodePipeline is $1/month per active pipeline. CodeBuild charges per build minute (~$0.005/minute). Small but non-zero.
- Not where the industry is going for small-to-medium projects. GitHub Actions and GitLab CI have won mindshare. CodePipeline is used in AWS-centric enterprises.

**Who uses this:** Large organizations with all-AWS infrastructure, enterprises with strict compliance requirements (everything must be in AWS), teams already deep in the AWS ecosystem.

#### 6. Jenkins

Self-hosted, open-source CI/CD server. The original CI/CD tool — 20+ years old, massive plugin ecosystem, runs anywhere.

**What it enables:**
- **Total control.** Run any build, any language, any tool, any deployment target. Plugin ecosystem covers everything.
- **Self-hosted.** Your CI/CD server, your data, your rules.

**Trade-offs:**
- **Requires a server to run Jenkins.** Defeats the serverless architecture. You'd need a VPS or EC2 instance just for CI/CD.
- Heavy operational burden — Java-based, plugin updates break things, security patches needed regularly.
- Groovy-based pipeline syntax has a steep learning curve.
- Massive overkill for a personal static site.
- The industry has moved to managed CI/CD (GitHub Actions, GitLab CI). Jenkins is legacy in most contexts outside large enterprises.

**Who uses this:** Large enterprises with complex, multi-stage build pipelines. Organizations that started CI/CD before GitHub Actions existed and haven't migrated. Android build farms. Not for new personal projects.

### How this maps to your project

| Option | Automation | AWS alignment | Setup effort | Cost | Learning value |
|---|---|---|---|---|---|
| Manual CLI | ❌ none | ✅ direct AWS | ✅ none | Free | ✅ understand the steps |
| Shell script | ⚠️ semi | ✅ direct AWS | ✅ trivial | Free | ✅ scripting basics |
| **GitHub Actions** | ✅ full | ✅ via AWS CLI | ⚠️ medium | Free (public) | ✅ industry-standard CI/CD |
| GitLab CI | ✅ full | ✅ via AWS CLI | ⚠️ medium | Free (400 min) | ✅ CI/CD concepts |
| AWS CodePipeline | ✅ full | ✅ native | ❌ complex | ~$1/mo | ⚠️ AWS-specific CI/CD |
| Jenkins | ✅ full | ✅ via plugins | ❌ complex + server | Server cost | ❌ legacy tool |

Jenkins is eliminated — needs a server, overkill, legacy. AWS CodePipeline is eliminated — more complex for less benefit than GitHub Actions, and the AWS learning value (IAM, CodeBuild) is marginal compared to what DP-6 already covers.

GitLab CI depends on DP-10 — if the repo is on GitHub, GitLab CI doesn't apply.

**The natural progression mirrors DP-6 (manual first, then automate):**

1. **Start with manual CLI** — run `astro build`, `aws s3 sync`, `aws cloudfront create-invalidation` by hand. Understand what deployment means.
2. **Wrap in a shell script** — `deploy.sh` makes it reproducible. Use this during active M1/M2 development when you're deploying frequently.
3. **Add GitHub Actions** — once the manual process is understood and the source repo is on GitHub (DP-10), automate it. Push to `main` → site deploys automatically.

This is the same learn-then-automate pattern as DP-6.

### Discussion

### Decision

**Chosen:** GitHub Actions (after a few manual deploys to understand the steps)

**Why:** GitHub Actions is the industry-standard CI/CD for GitHub-hosted projects. Push to `main` → build → deploy to S3 → invalidate CloudFront — fully automatic, free for public repos, secrets managed securely. The YAML workflow format and concepts (triggers, jobs, steps, secrets, runners) transfer to any CI/CD platform.

The first few deploys will be manual (`astro build` → `aws s3 sync` → `aws cloudfront create-invalidation`) to understand what the pipeline automates — consistent with the DP-6 learn-then-automate approach. Once the commands are understood, the GitHub Actions workflow replaces them. No shell script intermediate step — the jump from manual to GitHub Actions is small enough to skip the middle.

**v2 transition:** When SST replaces the manual AWS setup (DP-6), the GitHub Actions workflow changes from `aws s3 sync` to `sst deploy`. Same pipeline, different deploy command.

**What it enables for future projects (what you learned):**
- **CI/CD as a concept.** The automated build-test-deploy loop is foundational to professional software development. Understanding triggers, runners, secrets, and pipeline stages transfers to GitHub Actions, GitLab CI, Azure DevOps, or any CI/CD system.
- **GitHub Actions specifically.** YAML workflows, the actions marketplace, reusable workflows, matrix builds, environment protection rules — the skills used by most open-source projects and small-to-medium teams.
- **Secrets management pattern.** AWS credentials stored as GitHub Secrets, never in code. This pattern (external secrets injected at runtime) applies to every deployment pipeline regardless of platform.
- **Git-as-truth deployment model.** What's on `main` is what's live. Every deploy is traceable to a commit. This discipline — no manual server changes, no "I deployed from my laptop" — is how production teams operate.

**What was traded away:**
- No all-AWS CI/CD (CodePipeline). The AWS learning from DP-6 is sufficient — adding CodePipeline would teach AWS-specific CI/CD but not general CI/CD concepts. GitHub Actions is more portable knowledge.
- GitHub lock-in — workflows don't transfer to GitLab or Bitbucket without rewriting. Mitigated by the fact that CI/CD concepts do transfer, and GitHub is the likely long-term source host (DP-10).
- YAML debugging friction — workflow errors require push → wait → read logs → fix cycles. No local runner for testing workflows (though `act` exists as a third-party tool).

---

## DP-10: Source Hosting

Where does the code repository live? This is where your source code, content (markdown files from DP-4), infrastructure config (GitHub Actions from DP-9), and project history are stored. Beyond just "a place for code," source hosting platforms provide collaboration tools, CI/CD, project management, community features, and — increasingly — AI coding assistants.

### Constraints from prior decisions

- GitHub Actions chosen for CI/CD (DP-9) — requires GitHub as source host.
- Single developer — no team collaboration features needed in v1.
- Public repo is fine — the site is a personal portfolio, not proprietary software. Public also means free GitHub Actions minutes.

### Options considered

| Platform | How it works | Best for | Limitation |
|---|---|---|---|
| **GitHub** | Largest code hosting platform. Git repos + Issues + PRs + Actions + Pages + Packages + Copilot. 100M+ developers. | Open-source, personal projects, startups, most of the industry. The default. | Microsoft-owned — some developers prefer independent platforms. |
| **GitLab** | All-in-one DevOps platform. Git repos + CI/CD + container registry + issue tracking + wikis + security scanning. | Enterprise DevOps, self-hosted/on-premise needs, EU data residency. | Heavier UI, smaller community, CI/CD minutes limited on free tier (400/mo). |
| **Bitbucket** | Atlassian's code hosting. Integrates with Jira, Confluence, Trello. | Teams already in the Atlassian ecosystem (Jira for project management). | Smallest community of the three. Less relevant outside Atlassian shops. |
| **AWS CodeCommit** | AWS-native git hosting. IAM-based access, integrated with CodePipeline/CodeBuild. | All-AWS shops with compliance requirements. | ⚠️ **Deprecated** — AWS stopped accepting new customers in July 2024. Not a viable option. |

### Why this is effectively pre-decided

DP-9 chose GitHub Actions for CI/CD. GitHub Actions requires GitHub. The decision is already made — the only question is whether that's the right call, and whether understanding the alternatives is valuable.

**GitHub is the right call:** It's where the open-source and developer community lives, it's where recruiters look for code, it's where Claude Code and AI tools integrate most deeply, and it's free for everything this project needs. The portfolio site being visible on GitHub is itself a credibility signal for the BRD's goals.

**The alternatives matter for context:**
- If you ever work at a company using GitLab, you'll encounter GitLab CI, merge requests (not pull requests), and a different workflow. The concepts from GitHub transfer.
- If you work in an Atlassian shop, Bitbucket + Jira is the standard. Understanding the ecosystem matters, but it's learned on the job, not on a personal project.
- AWS CodeCommit is dead — worth knowing so you don't waste time evaluating it.

### Decision

**Chosen:** GitHub

**Why:** GitHub Actions (DP-9) requires it, the portfolio is a public credibility signal, the AI tooling ecosystem (Claude Code, Copilot) integrates best with GitHub, and it's the industry default for personal and open-source projects. Free for everything needed.

**What it enables for future projects (what you learned):**
- **GitHub workflow.** Repos, branches, pull requests, issues, Actions, secrets, releases — the collaboration model used by most of the software industry. Even as a solo developer, using branches and PRs builds habits that transfer to team environments.
- **Public portfolio as proof of work.** The repository itself is part of the portfolio — recruiters and peers can see the code, the commit history, the documentation, the decision-making process. This directly serves the BRD's credibility goal.
- **AI-assisted development.** GitHub is the primary integration target for AI coding tools — Claude Code, Copilot, Cursor, and others integrate most deeply with GitHub repos.

**What was traded away:**
- No exposure to GitLab's DevOps model (stronger built-in security scanning, environment management, container registry). Learnable later if needed.
- GitHub lock-in — git history is portable (it's just git), but Issues, Actions workflows, and PR history don't migrate easily. Low risk for a personal project.
