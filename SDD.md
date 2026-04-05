## 3\. SDD — Software Design Document

**(How the System Will Be Designed)**

**Analogy:** Now that we know what to build, SDD is the **architectural blueprint** — saying things like:

> *"We'll use a microservice architecture with services for Orders, Payments, and Users. Each will talk via REST APIs, and Redis will be used for session caching."*

This is where tech leads and architects **strategize** how everything connects — databases, modules, APIs — without necessarily choosing tools yet.

## Introduction & References

**Purpose.** This SDD describes the architectural design of v1 of Jirka Sindelar's personal website. It translates the business intent from [BRD.md](BRD.md) and the product behavior from [PRD.md](PRD.md) into a concrete technical design: stack choices, module layout, deployment topology, and the rationale behind each decision. It does **not** cover implementation-level detail (file names, function signatures, code patterns) — that belongs to the TSD and the code itself.

**Scope.** The design covers v1 as defined by the PRD: a responsive static site with bio, portfolio, blog, contact links, CV download, humor/easter eggs, Open Graph metadata, and privacy-respecting analytics. Architectural decisions are constrained by PRD NFR-8 — v1 ships as a static site but must not foreclose a future backend.

**Out of scope.** Backend implementation, database schemas, authentication, and payments. These are either out-of-scope per the BRD (accounts, payments — the latter permanently excluded) or deferred past v1 (any server-side features).

**Stakeholders.** Product Owner, Architect, and sole Developer: Jirka Sindelar.

**References.**
- [BRD.md](BRD.md) — Business Requirement Document (vision, audiences, KPIs, scope, risks).
- [PRD.md](PRD.md) — Project Requirement Document (user stories, functional and non-functional requirements, acceptance criteria, milestones).
- PRD [NFR-7](PRD.md#L73) — content editable without a CMS; load-bearing for the stack decision.
- PRD [NFR-8](PRD.md#L74) — future extendability without speculative abstractions; load-bearing for the stack decision.
- PRD [NFR-4, NFR-5, NFR-6](PRD.md#L70-L72) — privacy constraints; load-bearing for analytics choice.

## System Context

The system is a static website served to end-user browsers. Its context is deliberately minimal — fewer external dependencies mean fewer failure modes and better privacy posture.

**Actors.**
- **Tech Industry People** (primary audience per BRD) — arrive mostly on mobile, typically after meeting Jirka at a tech event.
- **Recruiters** — arrive via LinkedIn or shared links, mostly on desktop.
- **Jirka Sindelar** — sole content author and operator; edits content in source files and publishes via a commit.

**External systems the website interacts with.**
| External system | Direction | Purpose | Required? |
|---|---|---|---|
| **Visitor's browser** | Serves HTML/CSS/JS, images, CV PDF | Core delivery path | ✅ Yes |
| **Hosting / CDN** | Stores and serves build artifacts | Deployment target | ✅ Yes |
| **Privacy-respecting analytics provider** | Receives anonymized pageview pings from the browser | Measures PRD KPIs per FR-9 | ✅ Yes (per FR-9) |
| **Social platforms** (Slack, LinkedIn, etc.) | Fetch Open Graph metadata when URLs are pasted | Rich link previews per FR-10 | ✅ Yes (per FR-10) |
| **LinkedIn, GitHub, email client** | Receive outbound clicks from contact links | Contact mechanism per FR-5 | ✅ Yes (per FR-5) |
| **Source code host** (e.g. GitHub) | Stores source; triggers builds on push | Development workflow | ✅ Yes |
| **Build / CI system** | Runs static site generator, publishes to hosting | Deployment pipeline | ✅ Yes |

**What is deliberately NOT in the context.**
- No backend server owned by Jirka.
- No database.
- No third-party ad trackers, A/B testing tools, or chat widgets (prohibited by NFR-4).
- No CMS (prohibited by NFR-7).
- No user accounts or authentication (out of scope per BRD).
- No payment processors (permanently excluded per BRD).

## High-Level Architecture

The architecture is intentionally shallow — a static site served from a CDN to end-user browsers, with two small outbound integrations (analytics and external contact links). Depth and complexity are deliberately kept out to serve the BRD "over-engineering delays launch" risk.

### Architectural style

**Static Site Generation (SSG) with a future-ready framework.** Next.js is used in its static-export mode for v1: at build time, every page is rendered to HTML/CSS/JS and the resulting bundle is deployed to a CDN. No request-time code runs on a server owned by Jirka. Next.js's dynamic capabilities (API routes, server components, SSR, ISR) are *available but unused* in v1 — they remain as the documented extension path that satisfies NFR-8 without introducing speculative abstractions today.

### Logical layers (build-time)

```
┌─────────────────────────────────────────────────────────┐
│  Content Layer (source of truth)                        │
│  - Markdown files + frontmatter (bio, posts, projects)  │
│  - Static assets (images, CV PDF)                       │
└───────────────┬─────────────────────────────────────────┘
                │  read at build time
                ▼
┌─────────────────────────────────────────────────────────┐
│  Build Layer (Next.js + markdown pipeline + Tailwind)   │
│  - Parses markdown, applies templates, generates pages  │
│  - Compiles Tailwind, optimizes assets, emits HTML      │
└───────────────┬─────────────────────────────────────────┘
                │  produces
                ▼
┌─────────────────────────────────────────────────────────┐
│  Distribution Layer (static bundle on CDN)              │
│  - HTML, CSS, JS, images, fonts, CV PDF                 │
│  - Immutable per deployment; cheap to cache             │
└───────────────┬─────────────────────────────────────────┘
                │  served over HTTPS
                ▼
┌─────────────────────────────────────────────────────────┐
│  Runtime Layer (end-user browser)                       │
│  - Renders HTML, loads minimal JS, pings analytics      │
│  - Only outbound: contact links, OG metadata fetchers   │
└─────────────────────────────────────────────────────────┘
```

### Key architectural properties

- **No runtime server owned by Jirka.** The CDN is the "server". Nothing dynamic executes on hosting infrastructure in v1.
- **Content is in git.** Markdown files live in the repo alongside code. Publishing is a commit + build + deploy. This directly realizes NFR-7 (no CMS) and the PRD Milestone exit gates (content is versioned and diffable).
- **Immutable deployments.** Every build produces a fresh static bundle. Rollback is "redeploy the previous build" — cheap and safe.
- **Two outbound integrations only.** (1) GoatCounter analytics pings from the browser, (2) social platforms fetching Open Graph tags from public URLs. Both are one-way and low-risk.
- **Extension points are framework-native, not custom.** If a backend is ever needed (v2+), the extension path is "turn off static export and enable Next.js API routes / server components" — a documented, well-trodden path. No custom abstraction layers are added in v1 to prepare for this.

### What is explicitly NOT in the architecture

- No application server, no database, no cache layer, no message queue.
- No authentication service, no session storage.
- No request-time rendering, no edge functions (v1).
- No service-to-service communication (there's only one "service" — the static site).

The simplicity here is a feature, not a limitation. For v1's scope (per BRD), anything more would be over-engineering.

## Technology Stack & Tooling Decisions

Each decision below is the result of a trade-off against the PRD constraints. Full rationale and alternatives considered are captured in the **Design Decisions & Alternatives** section at the end of this document.

### Primary stack

| Concern | Decision | Key reason |
|---|---|---|
| **Framework / SSG** | **Next.js** (App Router, statically exported for v1) | Most documented path to a future backend (NFR-8); industry-standard ecosystem; large community means fewer surprises when extending. |
| **Language** | **TypeScript** | Next.js default; catches errors at build time; no runtime cost; improves maintainability (NFR-7). |
| **Content format** | **Markdown + YAML frontmatter** | Portable across frameworks (lowers lock-in risk); low friction for writing (NFR-7); git-based editing fits the "single commit to publish" model. |
| **Styling** | **Tailwind CSS** | Small final bundles (NFR-1 performance); fast iteration for a solo dev; framework-agnostic utility layer survives future changes. |
| **Analytics** | **GoatCounter** (cloud, free tier) | Cookie-free, GDPR-compliant, no consent banner (NFR-4, NFR-5, NFR-6); zero cost fits a personal project; small script has negligible impact on NFR-1. |

### Supporting tooling (defaults — revisit if reasons emerge)

| Concern | Default |
|---|---|
| **Package manager** | pnpm — fast installs, efficient disk usage, solid workspace support if the project ever grows. |
| **Node version** | Current Node LTS at the time of M1 kickoff, pinned via `.nvmrc` / `engines`. |
| **Image handling** | Next.js `next/image` component (when server-rendering) or pre-optimized static images (when statically exported). Both paths remain open pending the deployment decision. |
| **Markdown pipeline** | `next-mdx-remote` or `contentlayer`-style approach — to be finalized in M1 once the exact Next.js rendering mode is locked. |
| **Linting & formatting** | ESLint (Next.js preset) + Prettier. Enforced in CI, not just locally. |
| **Fonts** | System font stack or self-hosted web fonts only — no Google Fonts or other third-party font CDNs (NFR-4: no third-party trackers). |

### What this stack deliberately does NOT include

- **No CMS** — violates NFR-7.
- **No third-party analytics beyond GoatCounter** — no GA, no Segment, no Hotjar, no Mixpanel.
- **No runtime backend service** — v1 is statically exported. Next.js's API-route and server-component capabilities exist in the framework but are unused in v1.
- **No database, ORM, or data layer** — no entities persist beyond the repo's markdown files.
- **No authentication library** — no accounts in v1 or v2 (per BRD out-of-scope).
- **No payment SDK** — permanently excluded per BRD.
- **No A/B testing, feature flagging, or experimentation tool** — not needed at this scale and most violate NFR-4.

### Why Next.js over Astro (the tension worth naming)

NFR-8 originally named Astro, Next.js, and SvelteKit as valid choices. Astro would have been lighter for a purely-static v1 (ships zero JS by default). The choice of Next.js accepts a slightly heavier v1 bundle in exchange for the most documented, least-surprising path to adding a backend later. This is a conscious trade — the BRD's "over-engineering delays launch" risk is managed by statically exporting Next.js in v1 (treating it *as* an SSG) and only reaching for its dynamic features when a real need appears post-launch.

## Deployment Architecture

### Topology

```
┌───────────────────┐          ┌───────────────────────┐          ┌───────────────────────┐
│  Developer laptop │          │  GitHub (source +     │          │  GitHub Pages         │
│  - edit markdown  │─push──▶  │  GitHub Actions CI)   │─deploy▶  │  (CDN-backed static   │
│  - edit code      │          │  - runs next build    │          │   hosting)            │
│  - local preview  │          │  - produces /out dir  │          │  jirkasindelar.       │
└───────────────────┘          │  - publishes to       │          │  github.io            │
                               │    gh-pages branch    │          └──────────┬────────────┘
                               └───────────────────────┘                     │
                                                                             │ HTTPS
                                                                             ▼
                                                                   ┌───────────────────┐
                                                                   │  Visitor browser  │
                                                                   └───────────────────┘
```

### Deployment decisions

| Concern | Decision | Notes |
|---|---|---|
| **Source host** | **GitHub**, public repo | Doubles as engineering-craft evidence for Tech Industry People audience (BRD qualitative goal). Markdown content is public the moment it's deployed anyway. |
| **Repo type** | **User pages** — repo named `jirkasindelar.github.io` | Gives the cleanest URL (`https://jirkasindelar.github.io/`) without a subpath. Project-pages (`/repo-name/` subpath) would require extra Next.js `basePath` config and break absolute URLs in Open Graph tags. |
| **Hosting** | **GitHub Pages** | Free, integrated with the source host, zero operational burden. Served via GitHub's global CDN with HTTPS by default. |
| **Domain** | **`jirkasindelar.github.io`** — no custom domain in v1 | See *"Consequences of the domain and hosting choices"* below. |
| **Build / CI** | **GitHub Actions** | Runs `pnpm install`, `next build`, uploads the `out/` directory as a Pages artifact, and triggers a Pages deployment. Standard `actions/deploy-pages` flow. |
| **Deployment trigger** | Push to `main` branch | Every merged commit redeploys. No staging environment in v1 — branches + local preview cover pre-merge review. |
| **Rollback** | Re-run a previous successful GitHub Actions workflow, or revert the offending commit and let CI redeploy | Deployments are immutable; rollback is cheap. |
| **Preview builds** | Local `next dev` only in v1 | GitHub Pages doesn't offer per-PR preview URLs. Acceptable for a solo dev; revisit if this becomes painful. |

### Next.js configuration implied by GitHub Pages

GitHub Pages serves pure static files only — no Node runtime, no request-time code. This forces several Next.js configuration choices that lock in v1:

- **`output: 'export'`** must be set in `next.config.js`. Every page is rendered to HTML at build time.
- **`images.unoptimized: true`** — Next.js's default image loader requires a server. v1 must either disable the optimizer and serve pre-optimized static images, or use a third-party image loader. The former is simpler and fits v1.
- **No API routes, no server components with runtime data fetching, no `revalidate`, no middleware.** Everything must resolve at build time.
- **Trailing-slash handling** must be consistent with GitHub Pages's URL serving (typically `trailingSlash: true` to avoid 404s on directory-style URLs).
- **404 page** must be named `404.html` in the output — Next.js handles this automatically with static export but it's worth verifying at M1.

### Consequences of the domain and hosting choices (honest trade-offs)

These choices are intentional, but they create real consequences that future milestones must account for. Documenting them here so they don't come back as surprises.

**1. NFR-8 extendability is partially forfeited as long as hosting stays on GitHub Pages.**
NFR-8 commits v1 to "not foreclose a future backend". Next.js remains the right framework for that future, but **GitHub Pages cannot host a backend at all** — it is static-only by design. The extendability path becomes: *"if a backend is ever needed, migrate hosting to Vercel/Netlify/Cloudflare, at which point Next.js dynamic features become available without a framework rewrite."* This preserves the *framework* part of NFR-8 (no code rewrite) but sacrifices the *hosting* part (migration is required). This is a conscious trade — v1 prioritizes zero-cost and zero-ops over deploy-anywhere-anytime extensibility.

**2. Shareable URLs contain `github.io`, which may weaken the BRD "credibility" qualitative goal.**
The BRD commits to visitors feeling "this is exactly how a software engineer's website should look" (Recruiters) and "that's an interesting guy" (Tech Industry People). A `jirkasindelar.github.io` URL is unambiguous but less polished than a custom domain when pasted in Slack, LinkedIn, or verbally shared at a tech event. This is flagged as an **open risk** in the *Open Questions & Risks* section — it may warrant reconsidering custom domains post-launch based on real-world reception.

**3. Open Graph image URLs must be absolute.**
Because shareable URLs are the primary distribution mechanism (FR-10, US-9), every OG image URL in the rendered HTML must be fully qualified (`https://jirkasindelar.github.io/...`). Relative paths will break previews in some social platforms. This is a constraint on the Module / Component layer covered below.

**4. No edge or dynamic Open Graph image generation in v1.**
Vercel and others support runtime-generated OG images (per-post titles rendered on the fly). GitHub Pages cannot do this. OG images must be pre-generated at build time or authored manually. Acceptable for v1 given the expected volume of blog posts.

## Module / Component Breakdown

Because the system is a static site, "modules" map to **Next.js App Router route segments**, **content collections**, and **shared UI components** rather than traditional service modules. The breakdown below is a logical view — actual file paths and names are TSD-level concerns.

### Route modules (pages)

| Route | Purpose | Serves FRs | Notes |
|---|---|---|---|
| **`/` — Landing** | Hero + role/seniority + latest posts + selected projects + humor hook | FR-1, FR-11, serves US-4, US-5 ⭐, US-10, US-11 | Most important page for the primary use case (tech-event scan). Must be instant and scan-friendly on mobile. |
| **`/bio` — Bio / personal story** | Narrative bio with current role visible near top | FR-2, serves US-10, US-11 | Prose, not a resume dump. Voice-forward. |
| **`/work` — Portfolio index** | List of selected projects, highlighted items first | FR-3, serves US-5, US-8, US-11 | Used for scanning; top-of-list ordering matters. |
| **`/work/[slug]` — Portfolio project** | Detail page for a single project | FR-3 | Generated from markdown at build time. |
| **`/blog` — Blog index** | Reverse-chronological list of posts | FR-4, serves US-4 | |
| **`/blog/[slug]` — Blog post** | Individual post with distraction-free typography | FR-4, serves US-3 | Core retention vehicle. |
| **`/collaborate` *(or merged into `/bio`)* — "What I'm open to"** | Collaboration interests copy | FR-11, serves US-8 | Can be a standalone page or a section embedded on `/bio` — decision deferred to implementation. |
| **`/404`** | Not-found page | — | Next.js static export requirement. |

Exact URL shapes may be adjusted (e.g. `/about` vs. `/bio`, `/projects` vs. `/work`) during M1. What matters architecturally is the set of pages and the content collections that back them.

### Content collections (source of truth, read at build time)

| Collection | Location (logical) | Entries are | Frontmatter fields (minimum) |
|---|---|---|---|
| **Bio** | Single markdown file | One narrative document | `currentRole`, `seniority`, `location` |
| **Projects** | Directory of markdown files | One file per project | `title`, `slug`, `summary`, `highlighted` (bool), `order`, `sourceUrl?`, `demoUrl?`, `coverImage?` |
| **Blog posts** | Directory of markdown files | One file per post | `title`, `slug`, `date`, `summary`, `tags?`, `draft?`, `coverImage?` |
| **Site metadata** | Single config file | — | `siteName`, `siteUrl`, `defaultOgImage`, `contactLinks` (LinkedIn, GitHub, email) |

The exact field names are TSD-level; the important property at SDD level is that **every field needed by a component has a documented home in a frontmatter schema** — no scraping, no hidden conventions.

### Shared UI components (logical, not exhaustive)

| Component | Purpose | Used by |
|---|---|---|
| **`SiteHeader`** | Persistent nav + contact entry points | Every page (FR-5) |
| **`SiteFooter`** | Footer with contact links and any legal/humor copy | Every page (FR-5) |
| **`Hero`** | Landing-page intro with role, seniority, one-line pitch | `/` (FR-1, FR-2's "signal near top" requirement) |
| **`ProjectCard`** | Portfolio entry preview | `/`, `/work` |
| **`PostCard`** | Blog post preview | `/`, `/blog` |
| **`MarkdownContent`** | Renders markdown body with typography + code blocks | `/blog/[slug]`, `/work/[slug]`, `/bio` (AC-3.2) |
| **`ContactLinks`** | LinkedIn / GitHub / email cluster | `SiteHeader`, `SiteFooter`, `/bio` (FR-5) |
| **`CvDownloadButton`** | CTA to download the CV PDF | `SiteHeader`/`SiteFooter`/`/bio` (FR-6) |
| **`HumorSurface`** *(conceptual)* | Whatever mechanism delivers the easter egg(s) — could be a specific component, a custom 404, a console message, a konami-code handler, etc. | Scattered per FR-7 |
| **`OgMeta`** | Per-page Open Graph / Twitter Card metadata | Every route module (FR-10, US-9) |
| **`AnalyticsScript`** | Loads the GoatCounter tag once per session | Root layout (FR-9) |

### Cross-cutting modules

| Module | Responsibility |
|---|---|
| **Markdown pipeline** | Parses `.md` files, extracts frontmatter, transforms to HTML at build time (handles headings, code highlighting, images). |
| **Asset pipeline** | Optimizes images (pre-build or at build, not at runtime — see Deployment), copies the CV PDF into the output, handles fonts (self-hosted only per NFR-4). |
| **Link builder** | Produces absolute URLs for OG metadata and canonical tags. Needs the site's absolute base URL at build time (see Deployment trade-off #3). |
| **Tailwind theme** | Centralizes design tokens (color, type scale, spacing). One source of truth for the BRD "clean & non-distracting" qualitative goal. |

### What is NOT a module in v1

- No auth module, no user module, no session module.
- No database access layer.
- No API client (there are no APIs to call).
- No state management library (nothing meaningful is stateful on the client beyond local ephemeral UI state).
- No feature-flag module.

This list exists to make the absence deliberate — future contributors (including future-Jirka) should not reach for these without reconsidering v1's scope.

## Conceptual Data Model

**v1 has no runtime database and no persistent user data.** All "data" is authored content stored as markdown files and static assets in the repository. Content is read at build time, compiled into HTML, and served as static files.

This section exists for two reasons: (1) to document the **conceptual entities** so components and frontmatter schemas share one vocabulary, and (2) to sketch the **forward-looking model** that a future backend (per NFR-8) would most naturally inherit.

### v1 entities (authored content)

```
┌──────────────────────┐        ┌──────────────────────┐
│      SiteMetadata    │        │         Bio          │
│  - siteName          │        │  - currentRole       │
│  - siteUrl           │        │  - seniority         │
│  - defaultOgImage    │        │  - location?         │
│  - contactLinks[]    │        │  - body (markdown)   │
└──────────────────────┘        └──────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│       Project        │        │       BlogPost       │
│  - slug (unique)     │        │  - slug (unique)     │
│  - title             │        │  - title             │
│  - summary           │        │  - date              │
│  - highlighted: bool │        │  - summary           │
│  - order: int        │        │  - tags[]?           │
│  - sourceUrl?        │        │  - draft?            │
│  - demoUrl?          │        │  - coverImage?       │
│  - coverImage?       │        │  - body (markdown)   │
│  - body (markdown)   │        └──────────────────────┘
└──────────────────────┘
```

**Relationships.**
- `SiteMetadata` is a singleton, read by every page for header/footer/OG tags.
- `Bio` is a singleton, read by `/`, `/bio`, and OG cards.
- `Project` and `BlogPost` are collections. No explicit relationships between them in v1 (no "posts about a project" linking); if that ever appears it can be expressed via tags or frontmatter references.

### Identity & uniqueness

- `slug` is the URL-safe identifier for `Project` and `BlogPost`. It must be unique within its collection and stable — once a post is published, its slug is part of the shareable URL contract (AC-3.1) and must not change without a redirect strategy (which GitHub Pages cannot provide at runtime — another hosting consequence).

### What is NOT in the v1 data model

- **No user entity**, **no session entity**, **no comment entity**, **no like/reaction entity** — the site is write-only-by-Jirka and read-only-by-visitors.
- **No analytics events table** — analytics are anonymized aggregates held by GoatCounter, not stored by the site.
- **No form submissions** — per NFR-6 (no personal data collection) and FR-5 (contact is done via outbound links to LinkedIn/GitHub/email, not via an on-site form).

### Forward-looking model (non-binding sketch per NFR-8)

If a future version introduces a backend, the natural evolution of v1's content entities would be to persist them in a database (one row per Project / BlogPost) rather than as markdown files, with server-rendered pages drawing from the database instead of build-time file reads. **No v1 code should implement this sketch.** It exists here only to show that the v1 content shape is not a dead end.

---

## API / Interface Overview

**v1 exposes no HTTP APIs of its own.** The site is a collection of static files served by GitHub Pages. There is no origin server that Jirka operates, and therefore no API surface area to design, document, or secure at the application level.

### External interfaces the site participates in

| Interface | Direction | Consumer | Protocol | Purpose |
|---|---|---|---|---|
| **Static HTTP GET** | Inbound | Visitor browsers | HTTPS | Serve HTML, CSS, JS, images, CV PDF |
| **GoatCounter tracking beacon** | Outbound (from browser) | GoatCounter cloud | HTTPS `GET`/`POST` to GoatCounter's endpoint | Report an anonymized pageview (FR-9) |
| **Open Graph metadata fetch** | Inbound | Slack, LinkedIn, Twitter, WhatsApp, etc. | HTTPS `GET` on the page URL, parse `<meta>` tags | Rich link previews (FR-10, US-9) |
| **Outbound contact links** | Navigation only | LinkedIn, GitHub, mailto | Browser follows the link | Contact mechanism (FR-5, US-2) |

None of these are APIs that v1 defines. They are (a) standard static HTTP, (b) a third-party analytics endpoint owned by GoatCounter, and (c) HTML metadata standards that social platforms consume.

### Forward-looking interface note (non-binding per NFR-8)

If v2+ ever introduces dynamic features, the first API surface would live under `/api/*` via Next.js's API-route convention — a path Next.js reserves in its routing model. v1 does not define any such routes. When v2 arrives, the hosting migration described in Deployment Architecture is also required, because GitHub Pages cannot execute API routes.

---

## Data Flow

Data flow in v1 is minimal by design. Two flows matter: **build-time** (how content becomes the deployed site) and **runtime** (what happens when a visitor loads a page).

### Build-time flow (happens on every push to `main`)

```
1.  Developer commits markdown + code changes to git
        │
        ▼
2.  Push to GitHub `main` branch
        │
        ▼
3.  GitHub Actions workflow starts
        │
        ▼
4.  CI: pnpm install → next build (with output: 'export')
        │       │
        │       └─ Reads markdown files, frontmatter, assets
        │          Compiles Tailwind, bundles JS, optimizes assets
        │          Writes static files to ./out
        │
        ▼
5.  CI: uploads ./out as GitHub Pages artifact
        │
        ▼
6.  GitHub Pages deploys the artifact to jirkasindelar.github.io
        │
        ▼
7.  New version live (previous version replaced atomically)
```

### Runtime flow (every visitor page load)

```
1.  Visitor requests a page URL (e.g. https://jirkasindelar.github.io/blog/some-post/)
        │
        ▼
2.  GitHub Pages CDN serves the pre-built HTML + static assets over HTTPS
        │
        ▼
3.  Browser renders HTML, applies CSS, runs minimal JS
        │
        ├───────────────────────────────────────────────┐
        │                                               │
        ▼                                               ▼
4a. GoatCounter beacon fires asynchronously    4b. If the user clicks a contact link,
    (anonymized pageview — no cookies,             the browser navigates out to
    no personal data per NFR-6)                    LinkedIn / GitHub / mailto.
        │
        ▼
5.  No further server interaction. No polling, no websockets, no background fetches.
```

### What the data flow deliberately does NOT include

- No request to an application server owned by Jirka (there isn't one).
- No database query, no cache read/write on origin infrastructure.
- No personal-data exchange. The only data leaving the visitor's browser is the anonymized GoatCounter beacon (NFR-4, NFR-5, NFR-6).
- No write path from the visitor to the site. The site is read-only from the visitor's perspective.

---

## Security Considerations

v1's security posture benefits significantly from being a pure static site: the attack surface shrinks to the hosting platform, the content authoring workflow, and the outbound integrations. There is no application server, no database, no user accounts, and no payment processor to harden.

### Threats in scope for v1

| Threat | Mitigation | Owner |
|---|---|---|
| **Content tampering via compromised git push** | GitHub account 2FA, commit signing (`git commit -S`) for releases, protected `main` branch | Jirka |
| **Malicious third-party script injection** | Strict content policy: no external scripts beyond GoatCounter; self-hosted fonts only (NFR-4); every dependency added to `package.json` reviewed | Jirka + CI |
| **Dependency supply-chain compromise** | `pnpm audit` in CI; pinned versions in `pnpm-lock.yaml`; Dependabot (GitHub built-in) for security updates; minimal dependency count by design | Jirka + GitHub Dependabot |
| **XSS via untrusted markdown content** | Markdown is author-controlled (only Jirka writes it). Still, use a markdown pipeline that escapes HTML by default and opt into raw HTML only where explicitly needed. | Build pipeline |
| **Broken HTTPS / mixed content** | GitHub Pages serves HTTPS by default with auto-renewed certificates; all external links in markdown must use `https://`; linter rule or CI check to enforce | CI |
| **Leaked credentials in repo** | Public repo discipline: no `.env` files committed, secrets only in GitHub Actions secrets store, pre-commit hook (e.g. `gitleaks`) if affordable | Jirka |
| **Analytics data exfiltration / tracking creep** | GoatCounter is chosen precisely because it cannot track individual users. No cookies (NFR-5), no personal data (NFR-6), no fingerprinting. | Stack choice |

### HTTP security headers

GitHub Pages allows a limited set of response headers (no custom header configuration at the server level). The following are relied upon or simulated:

- **HTTPS everywhere** — enforced by GitHub Pages for `*.github.io` domains.
- **Content Security Policy (CSP)** — added via a `<meta http-equiv="Content-Security-Policy">` tag in the page `<head>` since GitHub Pages cannot set response headers. Policy forbids inline scripts by default, allows only self and the GoatCounter endpoint. *Meta-tag CSP is weaker than a response-header CSP, but it's the best available path on GitHub Pages.*
- **Referrer-Policy** — set via meta tag to `strict-origin-when-cross-origin` to limit referrer leakage.
- **`rel="noopener noreferrer"`** on every external link to prevent tab-nabbing.

### Privacy posture (cross-reference to NFRs)

Already covered by NFR-4, NFR-5, NFR-6 and reinforced by the analytics and hosting choices:
- No third-party trackers.
- No cookie banner (no cookies set that would require consent).
- No personal data collection.
- Site serves no forms that capture visitor input server-side (per FR-5, contact is outbound navigation only).

### What's out of scope for v1 security work

- Account security, password policies, MFA for visitors → **no accounts in v1**.
- Payment security, PCI compliance → **no payments ever** per BRD.
- Rate limiting, DDoS mitigation → **handled by GitHub Pages platform**, not the application.
- Secrets management for runtime services → **no runtime services**.
- Penetration testing → **scope is too small to justify**; dependency scanning and careful content review are the main controls.

## API / Interface Overview

## Data Flow

## Security Considerations

## Quality Attributes (NFR Mapping)

This section maps every PRD non-functional requirement to the specific architectural decisions that satisfy it. If an NFR is unsatisfied or only partially satisfied, it is flagged honestly.

| NFR | Requirement (summary) | How the design satisfies it | Status |
|---|---|---|---|
| **NFR-1 Performance** | Fast by default, feels instant | Static files on GitHub Pages CDN; zero runtime server work; Tailwind produces small CSS; Next.js static export strips unused JS; no third-party heavy scripts; self-hosted fonts; image optimization done at build time | ✅ Fully satisfied |
| **NFR-2 Accessibility** | Semantic HTML, alt text, keyboard nav, visible focus | Next.js + React render semantic markup by default; Tailwind exposes `focus-visible` utilities; design tokens enforce sufficient color contrast; CI check (e.g. `eslint-plugin-jsx-a11y`) enforces alt text and role hygiene | ✅ Architecturally enabled; requires discipline in M2–M3 |
| **NFR-3 Browser support** | Latest 2 versions of Chrome/Firefox/Safari/Edge, explicitly mobile Safari + Android Chrome | Next.js + Tailwind both target modern evergreen browsers by default; no features used that require polyfills on target versions; smoke test matrix runs at M3 exit gate | ✅ Fully satisfied |
| **NFR-4 Privacy: no third-party trackers** | No ad/tracking scripts | Only GoatCounter is loaded; no Google Fonts / Google Analytics / Meta Pixel / etc.; CSP meta-tag enforces allow-list | ✅ Fully satisfied |
| **NFR-5 Privacy: no cookie banner** | No analytics cookies requiring consent | GoatCounter is cookie-free by design | ✅ Fully satisfied |
| **NFR-6 Privacy: no personal data collection** | No forms storing user data, no accounts | No on-site forms (contact is outbound navigation); no accounts; GoatCounter collects aggregates only | ✅ Fully satisfied |
| **NFR-7 Maintainability** | Content editable without a CMS, single-commit publish | Content is markdown + frontmatter in git; publishing = commit + push; CI deploys automatically; no CMS in the loop | ✅ Fully satisfied |
| **NFR-8 Future extendability** | Don't foreclose a future backend; no speculative abstractions | Next.js is chosen because adding API routes/SSR later is a documented framework capability, no rewrite needed. **However**, GitHub Pages hosting is static-only, so a future backend would require a **hosting migration** (to Vercel/Netlify/Cloudflare) even though the framework does not change. No speculative abstractions are introduced in v1. | ⚠️ Partially satisfied (framework ✅, hosting ❌) — *see Open Questions & Risks* |

### NFR-8: honest accounting

The Deployment Architecture section already documented this trade. Summarizing here for completeness:

- **What is preserved:** the Next.js codebase itself would not need to be rewritten to add a backend. Files, routing, content pipeline, and component model all carry forward.
- **What is forfeited:** the hosting platform. GitHub Pages cannot execute server code; migrating to Vercel or equivalent is required *before* any backend feature can ship.
- **Why this is acceptable for v1:** (a) the probability that v1 needs a backend is low, (b) the migration itself is a known quantity (Next.js → Vercel is the default path), (c) the alternatives (Vercel from day one, custom domain from day one) add operational and financial cost that conflicts with the BRD over-engineering risk.

This is the single most important trade-off in the entire SDD. Recording it prominently is more valuable than pretending NFR-8 is fully satisfied.

## Design Decisions & Alternatives

Each entry records a significant decision, the alternatives that were considered, and the reason the chosen path won. Format is lightweight ADR (Architecture Decision Record). New decisions made post-v1 should be appended; existing ones should be edited only to mark them *superseded*, never rewritten.

### ADR-1 — Framework: Next.js (static export) over Astro or SvelteKit

**Decision.** Use Next.js in `output: 'export'` mode for v1.
**Alternatives considered.** Astro, SvelteKit, plain HTML/CSS.
**Why Next.js won.** Largest ecosystem and the most documented path from static site to backend (API routes, server components, SSR) without a framework rewrite. NFR-8 was the deciding criterion.
**Why not Astro.** Technically the best fit for a purely-static content site — ships zero JS by default, lighter v1 bundle. Lost on NFR-8 extendability confidence: Astro's backend story (server endpoints) is real but newer and less battle-tested industry-wide. Would be the top alternative if the v1 bundle size ever becomes a measurable problem.
**Why not SvelteKit.** Lightweight and technically excellent, but smaller ecosystem makes it a slightly less safe long-term bet.
**Why not plain HTML/CSS.** Would violate NFR-8 — adding a backend later would require re-platforming.
**Status.** Accepted.

### ADR-2 — Content format: Markdown + YAML frontmatter over MDX or HTML

**Decision.** Author all content as `.md` files with YAML frontmatter.
**Alternatives considered.** MDX (markdown + JSX), plain HTML in templates.
**Why markdown won.** Portability (framework-agnostic), low friction for writing (NFR-7), clean git diffs, and the fewest invitations to over-engineering. If a post ever needs an interactive element, it can be added as a custom component reference *inside* markdown without moving to full MDX.
**Why not MDX.** Tempts embedding framework components directly in content, which ties content to the framework and makes porting harder. Over-engineering risk for a solo project.
**Why not HTML templates.** Authoring friction is too high for long-form writing; directly hurts NFR-7 and the "Jirka will keep writing" BRD assumption.
**Status.** Accepted.

### ADR-3 — Styling: Tailwind CSS over plain CSS or CSS Modules

**Decision.** Tailwind CSS with a centralized theme.
**Alternatives considered.** Plain CSS + variables, CSS Modules.
**Why Tailwind won.** Fast iteration for a solo dev, small final CSS bundle (NFR-1), utility layer survives framework changes, ecosystem support and documentation are excellent.
**Why not plain CSS.** Slower to build consistent results on a solo project; easier to end up with inconsistent spacing/typography.
**Why not CSS Modules.** Framework-coupled, loses some of the "survives framework changes" benefit.
**Status.** Accepted.

### ADR-4 — Analytics: GoatCounter (cloud, free) over Plausible or Simple Analytics

**Decision.** GoatCounter (cloud free tier).
**Alternatives considered.** Plausible (cloud paid), Plausible (self-hosted), Simple Analytics.
**Why GoatCounter won.** Satisfies NFR-4/5/6 identically to Plausible/Simple Analytics, but is free and has a generous personal-use tier. Tiny tracking script, no cookies, no consent banner needed.
**Why not Plausible (cloud).** Equally good product but paid (~€9/month). Would be the first upgrade if GoatCounter's dashboards ever feel insufficient for the PRD KPIs.
**Why not Plausible (self-hosted).** Adds operational burden (VPS, updates, database) that conflicts with the BRD over-engineering risk.
**Why not Simple Analytics.** Equally privacy-respecting but paid and offers no meaningful advantage over GoatCounter for this project.
**Status.** Accepted.

### ADR-5 — Hosting: GitHub Pages over Vercel, Netlify, or Cloudflare Pages

**Decision.** GitHub Pages (free, `*.github.io` subdomain, served via GitHub's CDN).
**Alternatives considered.** Vercel, Netlify, Cloudflare Pages.
**Why GitHub Pages won.** Zero cost, zero operational burden, integrated with the source host, and sufficient for a pure-static v1. Fits the BRD over-engineering risk mitigation (minimize moving parts).
**Why not Vercel.** Made by the Next.js team, would be the most ergonomic choice, and unlocks the full NFR-8 extension path without a hosting migration. Free tier is sufficient. Lost because v1 is confirmed static and the zero-ops simplicity of Pages was preferred. **This is the strongest alternative and would be the natural migration target if a backend is ever added.**
**Why not Netlify.** Same category as Vercel; no decisive advantage for a Next.js project.
**Why not Cloudflare Pages.** Excellent CDN and privacy posture, but Next.js support has historically had more friction than Vercel.
**Status.** Accepted, with explicit acknowledgement that this decision partially forfeits NFR-8 (hosting migration would be required before any backend feature).

### ADR-6 — Domain: `jirkasindelar.github.io` (no custom domain in v1)

**Decision.** Do not register a custom domain for v1. Use the GitHub Pages default.
**Alternatives considered.** Custom domain registered before M1, custom domain registered before M4.
**Why the default subdomain won.** Zero cost, zero configuration, no DNS ops, no renewal concerns. Fits the BRD over-engineering risk mitigation.
**Why not a custom domain.** A `.com` would better serve the BRD "credibility" qualitative goal — a `github.io` URL is less polished when shared at tech events or pasted in Slack. The decision accepts this weakening of the credibility goal in exchange for zero-cost simplicity.
**Revisit trigger.** If, after launch, real-world feedback suggests the subdomain is hurting reception (e.g. recruiters commenting, Jirka feeling embarrassed sharing it at events), promote custom domain registration to a v1.1 priority.
**Status.** Accepted, flagged as a post-launch revisit candidate in *Open Questions & Risks*.

### ADR-7 — No CMS, content lives in git

**Decision.** All content is markdown in the repository; publishing is a git commit.
**Alternatives considered.** Headless CMS (Contentful, Sanity, Strapi), git-based CMS (Tina, Decap).
**Why git-only won.** NFR-7 explicitly rules out a CMS. Git provides version history, atomic publishing, and zero extra infrastructure.
**Why not a git-based CMS (Tina/Decap).** These edit markdown *through* a UI but still store in git. Would be tempting if Jirka ever wrote content on mobile, but adds a component to maintain and a surface for things to break. Revisit only if "writing from phone" becomes a real use case.
**Status.** Accepted.

### ADR-8 — CI/CD: GitHub Actions over other CI systems

**Decision.** Use GitHub Actions for build and deploy.
**Alternatives considered.** CircleCI, GitLab CI, hosting-provider-native CI (e.g. Vercel's).
**Why GitHub Actions won.** Free for public repos, tightly integrated with the source host and with GitHub Pages deployment (`actions/deploy-pages`), no additional accounts to manage.
**Why not others.** No compelling advantage for a personal project already on GitHub.
**Status.** Accepted.

## Open Questions & Risks

Items here are known unknowns or conscious risks carried into implementation. They are **not** blockers for starting M1 — each has a decision deferred to a specific milestone or a trigger that would force revisiting.

### Open questions (resolve during implementation)

| # | Question | Decide by | Owner | Notes |
|---|---|---|---|---|
| **OQ-1** | Exact markdown pipeline — `next-mdx-remote`, `contentlayer`-style, or custom `gray-matter` + `remark`? | M1 exit | Jirka | All three are viable with static export. Pick based on DX and ecosystem health at M1 kickoff. |
| **OQ-2** | URL shape for bio and portfolio pages (`/bio` vs `/about`, `/work` vs `/projects`) | M1 exit | Jirka | Purely a naming decision; has no architectural impact. |
| **OQ-3** | Whether "what I'm open to" (FR-11, US-8) is a standalone page or a section on `/bio` | M2 | Jirka | Defer until bio content is written — whichever reads better in context wins. |
| **OQ-4** | Concrete form of humor/easter eggs (FR-7, US-6) — custom 404, console message, konami-code handler, hidden game, etc. | M3 | Jirka | Creative decision; architecture supports any of these. |
| **OQ-5** | Image optimization strategy — pre-optimized at commit time, build-step tool, or Next.js `unoptimized` + manual discipline? | M1 exit | Jirka | Matters for NFR-1. Pre-optimizing at commit time is simplest on GitHub Pages. |
| **OQ-6** | Whether to enable commit signing and protected `main` branch from day one | M1 | Jirka | Cheap to set up; lean toward yes. |

### Risks

| # | Risk | Severity | Probability | Trigger to act | Mitigation |
|---|---|---|---|---|---|
| **R-1** | **NFR-8 hosting forfeiture becomes a real problem.** GitHub Pages cannot host a backend. If Jirka wants a dynamic feature later, a hosting migration is required before it can ship. | Medium | Low in v1 horizon; moderate long-term | First concrete use case for a backend feature (contact form, comments, dynamic OG, admin UI, etc.) | Migrate to Vercel. The Next.js codebase carries forward; only hosting + deploy pipeline changes. ADR-5 documents this explicitly. |
| **R-2** | **`github.io` URL weakens BRD credibility.** Sharing `jirkasindelar.github.io` at a tech event or in a recruiter DM may feel less polished than a custom `.com`, undermining the BRD "credibility" qualitative goal. | Low-Medium | Unknown until post-launch | Consistent feedback from real visitors/recruiters, or Jirka's own discomfort sharing the URL | Register a custom domain as a v1.1 priority. DNS pointing from a custom domain to GitHub Pages is a well-documented one-hour task. |
| **R-3** | **Over-engineering despite the design.** Even with a minimal architecture, Jirka may add speculative abstractions, premature optimization, or extra dependencies during implementation. Directly maps to the BRD "over-engineering delays launch" risk. | High | Medium | Any week where no content milestone progress is made but code/tooling churn happens | Enforce M1→M2 gate strictly: no M3/polish work until M2 content exists. "If it doesn't have an FR or AC, it's not v1." |
| **R-4** | **Content drought post-launch.** If Jirka stops writing after M4, retention KPIs collapse and NFR-7's "low-friction publishing" investment becomes wasted. Directly maps to the BRD "Jirka will keep writing" assumption. | High | Unknown | Return-visitor ratio trending down after month 2 post-launch; zero new posts for 6+ weeks | Not a v1 SDD concern per se, but the maintainability choice (NFR-7, markdown + git) was made specifically to minimize friction and maximize the odds that writing continues. Beyond that, this is a behavioral/discipline risk, not a technical one. |
| **R-5** | **CSP via `<meta>` tag is weaker than header-based CSP.** GitHub Pages cannot set response headers, so CSP must be delivered as a meta tag — which some attack vectors (e.g. injected scripts before the meta is parsed) can bypass. | Low | Low | Any security incident or audit finding tied to CSP | Acknowledge the limitation; keep the meta CSP as best-effort. If this ever becomes a real concern, it is another trigger to migrate hosting to a platform that supports response headers. |
| **R-6** | **Slug changes break shareable URLs.** Once a blog post is public, changing its slug breaks every inbound link (Slack/LinkedIn previews, bookmarks, shared links). GitHub Pages cannot issue server redirects, so there is no runtime recovery. | Medium | Low (disciplined authoring) | Any slug change on a post older than 24 hours | Treat slugs as immutable once a post is merged to `main`. If a slug must change, create a client-side redirect page at the old URL. |
| **R-7** | **GoatCounter free tier limits exceeded.** Unlikely at launch-day traffic, but if the site ever gets a viral share the free tier could hit limits. | Low | Very low | GoatCounter dashboard warnings or data gaps | Upgrade to GoatCounter paid, or migrate to Plausible. Switching analytics providers is a one-line script swap, not an architectural change. |

### What does NOT appear on this list (and why)

- "No database" is not a risk — it is a deliberate design property for v1 that satisfies multiple NFRs.
- "No authentication" is not a risk — it is out of scope per BRD.
- "No payments" is not a risk — it is permanently excluded per BRD.
- "Performance regressions" — NFR-1 has no hard numeric budget, so there is no regression bar to cross. If Jirka later commits to Core Web Vitals targets, this would become a risk worth tracking.