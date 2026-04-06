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

### What needs to be decided

When a visitor types the URL into their browser, **how does the site turn into the page they see?** This is the most fundamental architectural decision — everything else (framework, hosting, infrastructure complexity, cost, performance, security) follows from it.

### Why it matters

From the BRD and PRD, these constraints shape the decision:

- **Primary use case (US-5):** Someone at a tech event pulls up the site on their phone. The page must load **fast** — a slow site kills the "interesting guy" impression in seconds.
- **NFR-1 (Performance):** Site must feel instant.
- **NFR-8 (Extendability):** v1 must not foreclose adding a backend later. But v1 itself has no dynamic features (no accounts, no comments, no personalization, no forms that store data).
- **BRD over-engineering risk:** Simpler is better for v1 — don't add complexity that doesn't serve a current requirement.
- **Content type:** All content (bio, portfolio, blog) is authored by one person (Jirka) and changes infrequently (when a new post is written). There is no user-generated content.
- **No user accounts, no payments, no database** — per BRD scope.

### Full landscape of options

---

#### Option 1: Static Site Generation (SSG)

**How it works.** All pages are pre-built at build time — before any visitor arrives. The build step reads your content (markdown files, templates), processes it, and outputs plain HTML/CSS/JS files. These files are uploaded to a server (or CDN) that simply **serves them as-is** to every visitor. No code runs on the server when someone visits.

**Analogy.** It's like printing a magazine. You do all the work upfront (writing, layout, printing), and then every reader gets an identical copy. Changing content means printing a new edition.

**What business capabilities this enables — what an architect sees.**

An architect who deeply understands SSG sees these opportunities:

- **Content businesses at near-zero infrastructure cost.** Because there's no server running, hosting is free or cents per month. This makes content-first businesses viable at any scale — from a personal blog to a media company serving millions of readers. The business model doesn't need to cover infrastructure costs. Example: many developer documentation sites (Stripe docs, Tailwind docs) are SSG — they serve millions of readers at negligible cost.

- **Global performance without engineering effort.** SSG files can be deployed to CDNs (networks of servers worldwide). A reader in Tokyo gets the page from a Tokyo server; a reader in London from a London server. You get the performance of a global infrastructure without building one. This enables businesses where speed is the value proposition — e.g. a news site where being 500ms faster than competitors means readers prefer you.

- **Security as a business feature.** No server means no server to hack. No database means no data breach. For industries where trust is the product (banking, healthcare, legal), being able to say "we have no server-side attack surface" is a real business advantage.

- **Products where content changes slowly.** Blogs, documentation, marketing sites, portfolio sites, knowledge bases, recipe sites, review sites — anywhere the content is written by a small team and consumed by many readers. The rebuild-on-change model (1-2 minutes) works perfectly because content changes hours or days apart, not seconds.

- **What SSG does NOT enable.** You cannot build a product where each user sees different content (personalized feeds, dashboards, "logged in as X"). You cannot build real-time features (chat, collaboration, live scores). You cannot build anything that requires user-generated content stored on your server (comments, reviews, uploads) without bolting on external services. If a client says "I want something like Twitter" and you only know SSG, you'll either fail or over-engineer a Frankenstein.

**What this means in practice for any project using SSG:**
- Every content change (new blog post, bio edit) requires a rebuild and redeploy — typically automated (push to git → CI builds → deploys in 1-2 minutes).
- Every visitor gets the exact same page. No personalization.
- The server does zero work per visitor — it just hands out pre-built files.

**Trade-offs:**
- ✅ Fastest load time possible.
- ✅ Free or nearly free hosting.
- ✅ Most secure — smallest attack surface.
- ✅ Simplest to operate — no servers to maintain.
- ✅ Works offline / on spotty conference WiFi once loaded.
- ❌ Every content change needs a rebuild (1-2 min typically, automated).
- ❌ Cannot do anything dynamic per-visitor without client-side JS or external services.
- ❌ Adding dynamic features later requires either: adding client-side JS that talks to external services, or migrating to a different rendering strategy.

**Who uses this.** Most developer blogs and portfolios. Dan Abramov's blog, Josh Comeau's site, Tailwind CSS docs, Stripe docs, many marketing sites for startups.

---

#### Option 2: Server-Side Rendering (SSR)

**How it works.** When a visitor requests a page, a **server receives the request, runs code, generates the HTML on the fly**, and sends it back. The server might read from a database, check if the user is logged in, personalize the content, or fetch data from APIs — all before the visitor sees anything.

**Analogy.** It's like a restaurant kitchen. Every order is cooked fresh. The customer gets exactly what they asked for, but they have to wait for it to be prepared.

**What business capabilities this enables — what an architect sees.**

An architect who deeply understands SSR sees these opportunities:

- **Personalized products.** Every user can see different content. This is what makes products like Netflix ("recommended for you"), Amazon ("based on your purchase history"), or a banking dashboard ("your accounts, your transactions") possible. If the core value proposition of your product is "each user sees something tailored to them," you need SSR (or SPA with API).

- **Real-time data products.** Stock tickers, sports scores, flight status boards, monitoring dashboards — anywhere the data changes frequently and must be fresh when the page loads. SSR fetches the latest data on every request. This enables products in finance, logistics, operations, news — anywhere freshness is the value proposition.

- **SaaS and B2B platforms.** Most SaaS products (Jira, Slack web, GitHub, Figma) use SSR or a hybrid because every user is logged in, has different data, different permissions, different team contexts. The server figures out "who are you and what should you see" before rendering.

- **SEO-critical dynamic content.** If you need Google to index pages that are different for different contexts (e.g. location-specific content, product catalog pages), SSR gives you pre-rendered HTML that search engines can crawl — unlike SPA where Google must execute JavaScript.

- **Full-stack in one codebase.** The same project handles the frontend AND the backend (API endpoints, database queries, authentication). For a startup MVP, this means one developer can build the entire product. No separate "frontend team" and "backend team" needed — one person, one project.

- **What SSR does NOT enable that SSG does better.** SSR cannot match SSG's raw speed for static content — there's always server work per request. SSR adds operational complexity (a server must run, must scale, must be monitored). SSR costs more (compute per request vs. file serving). For content that doesn't change per user, SSR is doing unnecessary work.

**What this means in practice for any project using SSR:**
- A server must be running 24/7 (or spun up on demand — "serverless").
- Each page load involves: receive request → run server code → maybe query database → generate HTML → send response.
- More moving parts: server runtime, possibly a database, secrets management, monitoring, error handling.

**Trade-offs:**
- ✅ Full dynamic capability — can do anything (auth, personalization, real-time data, API endpoints).
- ✅ Backend and frontend in one project.
- ✅ SEO-friendly even for dynamic content.
- ✅ Best learning path for full-stack development.
- ❌ Slower than SSG for content that doesn't change per-visitor.
- ❌ Costs money — a server must run.
- ❌ More complex to operate — monitoring, scaling, error handling, cold starts.
- ❌ Larger attack surface — server code can have vulnerabilities.

**Who uses this.** GitHub, Vercel's own dashboard, most SaaS products, e-commerce platforms (Shopify storefronts), banking web apps, any product with user accounts and personalized content.

---

#### Option 3: Single-Page Application (SPA)

**How it works.** The server sends a nearly-empty HTML page plus a large JavaScript bundle. The visitor's **browser downloads the JS, executes it, and renders the entire site client-side**. Navigation between pages happens without full page reloads — JS swaps content in and out.

**Analogy.** It's like shipping someone a flat-pack kit. They receive a box of parts (the JS bundle) and their browser assembles the furniture (the page) on site.

**What business capabilities this enables — what an architect sees.**

An architect who deeply understands SPAs sees these opportunities:

- **App-like experiences in the browser.** If the product should feel like a native app — instant transitions, smooth animations, complex interactive state, drag-and-drop, collaborative editing — SPA is the natural fit. Think Figma, Google Docs, Notion, Spotify's web player. The user loads once and then has a rich, uninterrupted experience.

- **Complex interactive tools.** Data visualization dashboards, video editors, code editors (VS Code in the browser), drawing tools, spreadsheets, project management boards. Anything where the user is actively manipulating data in the browser rather than passively reading content.

- **Offline-capable products.** SPAs can cache their JS bundle and data locally, enabling products that work without internet. This enables field-work tools (construction inspectors, delivery drivers), developing-market apps where connectivity is unreliable, or productivity tools that work on planes.

- **Separation of frontend and backend teams.** The SPA is a completely separate application from the backend API. Large companies often build this way: the API team builds the backend, the frontend team builds the SPA, they communicate via a documented API contract. Enables organizational scaling (different teams, different deploy schedules, different technologies).

- **What SPA does NOT enable well.** SEO is a challenge — search engines may not execute JavaScript properly, so content may not be indexed. First load is slow (the entire JS application must download and execute before the user sees anything). Accessibility is harder. And for content-heavy sites (blogs, docs, portfolios), SPA is actively harmful — you're making the user download an entire application just to read text.

**What this means in practice:**
- First load is slow (browser must download and execute the entire JS bundle).
- Subsequent navigation is fast and smooth (no page reloads).
- The site shows literally nothing if JavaScript fails to load or is disabled.
- Requires a separate backend API for any server-side functionality.

**Trade-offs:**
- ✅ Richest interactivity — best for app-like experiences.
- ✅ Smooth navigation after initial load.
- ✅ Clean separation of frontend and backend.
- ✅ Good learning path for frontend framework skills (React, Vue, Angular).
- ❌ Slow first load — directly conflicts with "instant impression" use cases.
- ❌ SEO challenges.
- ❌ Shows blank page while JS loads.
- ❌ Accessibility challenges (NFR-2).
- ❌ Overkill for content sites.

**Who uses this.** Gmail, Figma, Notion, Spotify web, VS Code web, Jira. Almost exclusively for web *applications*, not content *sites*.

---

#### Option 4: Hybrid / Islands Architecture

**How it works.** Pages are statically generated (like SSG), but specific parts of the page can be "islands" of interactivity — small pieces of JavaScript that hydrate independently. The rest of the page is pure HTML with zero JavaScript.

**Analogy.** It's like a printed magazine where a few pages have interactive QR codes or pull-tabs. Most of it is static print; only specific spots are interactive.

**What business capabilities this enables — what an architect sees.**

An architect who understands the islands architecture sees:

- **Content sites that need targeted interactivity.** A documentation site with a live code playground. A recipe site with an interactive ingredient scaler. A portfolio with an embedded interactive demo. A blog with a search widget. The bulk is fast static content; the interactive parts load only when needed.

- **E-commerce product pages with SSG performance.** The product description and images are static (fast), but the "add to cart" button, size selector, and inventory checker are interactive islands. This gives SSG speed for the part users see first, with SPA-like interactivity for the parts that need it.

- **Progressive enhancement as a business strategy.** The core content works without JavaScript. Interactive features enhance but don't block the experience. This means the site works on slow devices, old browsers, and screen readers — expanding the addressable audience.

- **What islands don't enable that you don't already get from SSG.** If your site has no interactivity at all (pure reading experience), islands architecture adds mental complexity for zero benefit — you'd just use plain SSG. And if your site needs *full-page* interactivity (every element is dynamic, like a dashboard), islands don't help — you'd use SSR or SPA.

**Trade-offs:**
- ✅ Best of SSG (speed, simplicity, security) with targeted interactivity.
- ✅ Ships less JavaScript than SPA — only what's needed per island.
- ✅ Natural fit for content + small interactive elements (your easter eggs, FR-7).
- ❌ Newer concept — smaller community, fewer tutorials.
- ❌ No benefit over plain SSG if there's truly no interactivity needed.
- ❌ Adds a mental model you need to learn (what's an island, when to hydrate).

**Who uses this.** Astro is the main framework built around this. Some Next.js and SvelteKit patterns achieve similar results. Used by content-heavy sites that need some interactivity.

---

#### Option 5: Traditional Multi-Page Application (MPA / "old school server")

**How it works.** A server (PHP, Ruby, Python, Java, Node.js) renders full HTML pages using templates. Every navigation is a full page reload — browser requests a URL, server generates HTML, browser renders it. This is how the web worked before SPAs and modern frameworks.

**Analogy.** It's like a library where you request a book, the librarian fetches it from the shelf, and hands you a physical copy. Every request is a round trip.

**What business capabilities this enables — what an architect sees.**

An architect who understands traditional MPAs sees:

- **The fastest path to a full product.** Frameworks like Ruby on Rails, Django, and Laravel come with everything: database ORM, authentication, admin panel, email sending, background jobs, file uploads, form handling. An experienced developer can build an MVP with user accounts, a database, payments, and an admin dashboard in a weekend. No other approach matches this speed for "full product from zero."

- **The backbone of the existing web.** WordPress powers ~40% of the web. Most banking web apps, government portals, internal tools, and enterprise systems are traditional MPAs. Understanding this architecture means understanding most of the software that exists today — which is invaluable if you want to work in enterprise, consulting, or legacy modernization.

- **Products where "boring" is a feature.** In banking, healthcare, government, and infrastructure — industries where reliability matters more than user experience — the simplicity and maturity of MPA architecture is an advantage. Few moving parts, battle-tested patterns, massive ecosystem of developers who understand it. When a bank chooses Django or Java Spring, they're choosing decades of proven reliability.

- **Admin panels, internal tools, back-office systems.** Almost every company has internal tools that don't need to be pretty or fast — they need to be built quickly, work reliably, and show data from a database. MPA frameworks excel here. Django Admin, Rails Admin, Laravel Nova — these generate working admin panels automatically from your database schema.

- **What MPA does NOT enable well.** The user experience is "clunkier" than SPA or modern SSR — every navigation reloads the whole page. Rich interactivity (drag-and-drop, real-time updates, smooth transitions) requires bolting on JavaScript separately. And for a purely static site (no database, no backend logic), an MPA adds unnecessary infrastructure.

**Trade-offs:**
- ✅ Fastest path to a full product with database, auth, admin.
- ✅ Massive ecosystem — millions of tutorials, plugins, mature communities.
- ✅ Battle-tested in enterprise and regulated industries.
- ✅ Excellent learning path for backend development and understanding how most existing software works.
- ❌ Requires a running server (cost, ops).
- ❌ Slower page loads than SSG unless heavily cached.
- ❌ Overkill for a site with no database or backend logic.
- ❌ Clunkier UX compared to modern approaches.

**Who uses this.** WordPress (~40% of the web), most bank web portals, government sites, internal enterprise tools, e-commerce (Shopify backend, Magento). Ruby on Rails built early Twitter, GitHub, Basecamp. Django built Instagram, Pinterest, Disqus.

---

### How these relate to your BRD/PRD constraints

| Constraint | SSG | SSR | SPA | Hybrid | MPA |
|---|---|---|---|---|---|
| Fast mobile load (US-5, NFR-1) | Best | Good (with caching) | Worst | Best | Good (with caching) |
| No accounts, no DB needed (BRD scope) | Fits perfectly | Overkill | Overkill | Fits perfectly | Overkill |
| Future backend possible (NFR-8) | Needs migration or external services | Built-in | Needs separate backend | Some built-in | Built-in |
| Low cost | Free options | Free tiers exist, but limited | Free (same as SSG for hosting) | Free options | Needs server ($5-20/mo minimum) |
| Low operational complexity (BRD risk) | Lowest | Medium-High | Low (same as SSG) | Low | Medium-High |
| Security (NFR-4, NFR-6) | Best (no server) | More surface | Same as SSG | Best (no server) | More surface |
| Content changes | Rebuild needed (1-2 min) | Instant (if DB) | Rebuild needed | Rebuild needed | Instant (if DB) |
| Easter eggs / interactivity (FR-7) | Possible with client JS | Full capability | Full capability | Natural fit (islands) | Possible with client JS |
| **Learning value** | Modern frontend + deployment | Full-stack development | Frontend frameworks | Cutting-edge patterns | Backend + how most existing software works |

### Discussion

This is where we talk before you decide. Some questions to consider:

- **What do you want to learn from building this?** Not just "how to make a website" — which *kind* of technical capability do you want to build? Modern frontend tooling? Full-stack development? Backend architecture? Cloud infrastructure? Your answer might point toward a rendering strategy that's "overkill" for the website's requirements but perfect for your learning goals.

- **About NFR-8 (future backend) — how real is it?** If there's a high chance you'll want dynamic features within a year (comments, contact form that stores data, user analytics dashboard, admin panel), that changes the calculus significantly. If the site will likely stay static for years, it matters less.

- **You mentioned AWS.** AWS is primarily a hosting/infrastructure decision (DP-6), but it's relevant here because: SSG on AWS = S3 + CloudFront (very simple). SSR on AWS = Lambda + API Gateway or ECS (much more to learn). MPA on AWS = EC2 or ECS (classic server ops). If you want meaningful AWS learning, SSR or MPA gives you more to work with than SSG.

- **How do you feel about the rebuild-on-every-change model?** For SSG/Hybrid, every blog post triggers a 1-2 minute automated rebuild. Is that acceptable, or would you prefer instant publishing?

- **Would you rather ship the website fast and learn from building it, or learn deeply from the architecture even if it takes longer?** SSG is the fastest path to a live site. SSR or MPA would teach you more architecture but take longer and add complexity.

- **Agent-friendliness (NFR-9) and future AI features (NFR-8).** The BRD now includes a future direction toward agent-consumable content and potentially an interactive AI feature. For v1, agent-friendliness is mostly about structured markup (works with any rendering strategy). But the future AI feature strengthens the case for a stack where adding API routes is a natural extension — not a rewrite.

**There is no recommendation here.** All five options are legitimate. Your BRD/PRD constraints point toward SSG or Hybrid as the most practical fit for the website itself — but "practical fit" is not your only criterion. If learning full-stack architecture or AWS infrastructure matters more to you than shipping the simplest possible v1, that's a valid and intelligent reason to choose differently.

### Decision

*(To be filled in after discussion)*

**Chosen:** ...
**Why:** ...
**What it enables for future projects (what you learned):** ...
**What was traded away:** ...

---

## DP-2: Framework / Tool

*(Depends on DP-1. The full landscape of options will be presented after the rendering strategy is chosen — the rendering strategy eliminates many framework options and makes others relevant.)*

---

## DP-3: Programming Language

*(Depends on DP-2. The framework choice heavily constrains or decides the language.)*

---

## DP-4: Content Management

*(How is content authored and stored? Markdown in git, headless CMS, database, HTML templates? Partially constrained by PRD NFR-7 which says no CMS — but understanding what CMS options exist and why companies use them is part of the architect's knowledge.)*

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
