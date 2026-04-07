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

**Open question for you:** Do you see yourself wanting interactive components inside blog posts in v1? Or is v1 purely text + code blocks + images, with interactive elements reserved for the islands (easter eggs, etc.) outside of blog content?

---

## DP-5: Styling Approach

*(CSS framework, utility CSS, CSS-in-JS, component libraries, or plain CSS? This decision affects development speed, design consistency, and the skillset you build.)*

---

## DP-6: Hosting / Infrastructure

*(Where does the site live? GitHub Pages, Netlify, Vercel, AWS S3+CloudFront, AWS Amplify, AWS EC2, Cloudflare Pages, DigitalOcean, Railway, Fly.io, self-hosted VPS? This is where your AWS interest comes in — the full landscape of cloud infrastructure options will be explored here.)*

---

## DP-7: Domain

*(Custom domain or hosting subdomain? Which registrar? What does the domain mean for brand credibility per BRD?)*

---

## DP-8: Analytics

*(How do we measure the BRD's KPIs while respecting NFR-4/5/6 privacy constraints? What analytics options exist, what do they enable, and what are the privacy trade-offs?)*

---

## DP-9: CI/CD Pipeline

*(How does code go from "committed" to "live"? GitHub Actions, GitLab CI, AWS CodePipeline, Jenkins, manual deploy? What does each enable in terms of development workflow and team scalability?)*

---

## DP-10: Source Hosting

*(Where does the code repository live? GitHub, GitLab, Bitbucket, AWS CodeCommit? What does each enable beyond just storing code?)*
