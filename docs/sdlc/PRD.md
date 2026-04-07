## 2\. PRD — Project Requirement Document

## Overview & Use Cases

**What this document covers.** This PRD translates the business intent captured in [BRD.md](BRD.md) into concrete product behavior for v1 of Jirka Sindelar's personal website. It defines the user stories the site must serve, the functional and non-functional requirements that realize them, the acceptance criteria that prove each story is done, and the dependencies and milestones that sequence the work.

**Product in one line.** A responsive static website that presents Jirka Sindelar's story, work, and writing in a voice that is distinctively his — built to be memorable, credible, and worth returning to.

**Long-term direction.** The site evolves into Jirka's digital avatar — an augmented self that introduces itself to both humans and AI agents, advertises what it can provide, and lets anyone easily connect their agent to learn about Jirka's work, thinking, and interests. v1 serves humans with passively agent-readable structure; v2+ adds active agent capabilities. See [BRD future direction](BRD.md).

**Primary use cases.** Use case #1 is the **main** scenario the site is designed for — the one that shapes every design and content decision. The remaining use cases are valid and supported, but secondary.

1. **Tech-event follow-up (PRIMARY).** Jirka meets a fellow engineer at a conference, meetup, or industry event and either shows them the site directly on his phone or gives them the link to look up later. The visitor — likely on mobile, likely within minutes of a face-to-face conversation — scans the site for 30–60 seconds and walks away with an impression along the lines of *"that's an interesting guy"*. This is the use case that determines whether the site succeeds: it places heavy weight on mobile first-impression, clarity of the landing page, and the personality/humor layer. Every other use case is supported, but if a design trade-off forces a choice, this one wins.
2. **Evaluate Jirka as a hire.** A recruiter or hiring manager lands on the site (usually via LinkedIn or a shared link), skims the bio and portfolio within a minute, forms a judgment, and either reaches out, downloads the CV to forward internally, or bookmarks the site for later.
3. **Read Jirka's writing.** A peer engineer, collaborator, or return visitor comes for the blog — either a specific post that was shared with them, or to check what's new since their last visit. This is the retention loop the primary KPI depends on, and it's where a strong first impression from use case #1 converts into a returning reader.
4. **Get in touch.** Any visitor who wants to contact Jirka finds a clear path to LinkedIn, GitHub, or email within seconds of looking for it.
5. **Agent discovers Jirka (v2+, not v1).** Someone's personal AI agent — a recruiter's assistant, a collaborator's research agent, a conference organizer's tool — connects to the site, discovers what it can provide ("I can tell you about Jirka's work, his thinking on agentic design, his background, whether he's open to collaboration"), and queries it on behalf of its human. The site responds with structured data and content. In v1, this use case is partially served by structured HTML and JSON-LD (agents can passively read the site). In v2+, the site actively advertises capabilities and exposes dedicated endpoints.

**Traceability note.** Throughout this document, user stories are numbered `US-n`, functional requirements `FR-n`, non-functional requirements `NFR-n`, and acceptance criteria `AC-n`. Each FR cites the US-IDs it serves; each AC cites the US-ID it proves.

## User Stories

Each story has a `US-n` ID, a primary audience (from the BRD's Target Audiences table), and the "As a… I want… so that…" form. Functional Requirements and Acceptance Criteria below cite these IDs.

| ID | Audience | Story |
|---|---|---|
| **US-1** | Recruiters | As a recruiter or hiring manager, I want to download a PDF CV from the site, so I can forward it to my team or attach it to an internal system. |
| **US-2** | Both | As a visitor, I want clear, obvious links to LinkedIn, GitHub, and email, so I can reach Jirka without friction. |
| **US-3** | Both | As a visitor who received a link to a specific blog post, I want to read it with good typography and no distractions, so I can enjoy the content. |
| **US-4** | Both | As a return visitor, I want to see the newest blog posts and projects on the landing page, so I can quickly tell whether anything is new since my last visit. *(Directly serves the retention KPI, for Tech Industry People checking for new writing and for Recruiters returning when a role opens.)* |
| **US-5** ⭐ *primary* | Tech Industry People (met at a tech event) | As someone in the tech industry — engineer, PM, PO, founder — who just met Jirka at a conference or meetup, I want to scan his portfolio and personality on my phone within a minute, so I can form a snap judgment that "this is an interesting guy" without digging through long pages. **This is the primary user story** — it owns the primary use case and drives design trade-offs. |
| **US-6** | Tech Industry People | As a visitor, I want to encounter jokes, games, or hidden surprises as I browse, so the site feels memorable and personal — the humor is what turns a 30-second scan into a lasting impression. |
| **US-7** | Both | As a visitor arriving on a phone (typically after meeting Jirka at an event, or via a LinkedIn or Slack link), I want the site to work cleanly on mobile, so I don't bounce due to broken layout. |
| **US-8** | Tech Industry People | As a potential collaborator in the tech industry, I want to understand what kinds of projects interest Jirka, so I know whether a collaboration pitch is worth sending. |
| **US-9** | Recruiters | As a recruiter, I want to copy a shareable link that renders a good preview when pasted in Slack, LinkedIn, or email, so I can easily pass the site to a hiring manager. |
| **US-10** | Both | As a visitor, I want to read a narrative bio that goes beyond a resume, so I can get a sense of who Jirka is as a person. |
| **US-11** | Recruiters | As a recruiter, I want to form a judgment about Jirka's experience and quality of work in under a minute, so I can decide whether to reach out with a role. The site must surface enough signal — current role, seniority, selected work — near the top of the bio and portfolio that I don't have to dig. |
| **US-12** *(v2+)* | AI Agents | As an AI agent acting on behalf of a human (recruiter, collaborator, researcher), I want to discover what the site can tell me about Jirka and query it in a structured format, so I can efficiently provide my human with relevant information about his work, thinking, and availability. |

**Audience coverage check.** Both BRD audiences have dedicated stories, plus a future agent audience:
- **Tech Industry People** (primary): US-5 ⭐, US-6, US-8.
- **Recruiters**: US-1, US-9, US-11.
- **Both audiences**: US-2, US-3, US-4, US-7, US-10.
- **AI Agents** (v2+): US-12. In v1, partially served by NFR-9 (structured markup).

## Functional Requirements

Each `FR-n` describes *what* the site must do. Every FR traces to one or more BRD in-scope items and to the user stories it serves. *How* it's built (stack, framework) is a design decision, not a requirement.

| ID | Requirement | Serves | BRD in-scope item |
|---|---|---|---|
| **FR-1** | The site provides a landing page that presents, at minimum: a short hero introducing Jirka (including current role and seniority signal), entry points to bio/portfolio/blog, and the most recent blog posts and/or projects. | US-4, US-10, US-11 | Bio, Blog, Portfolio |
| **FR-2** | The site provides a dedicated bio / personal-story page with narrative content going beyond a resume. Key professional signal (current role, years of experience, seniority) is visible near the top so recruiters can evaluate quickly without reading the full narrative. | US-10, US-11 | Bio |
| **FR-3** | The site provides a portfolio section listing selected projects, each with a short writeup and (where applicable) a link to source or live demo. The top of the portfolio shows selected/highlighted work first so a scanning visitor sees strongest signal immediately. | US-5, US-8, US-11 | Portfolio |
| **FR-4** | The site provides a blog section with an index (reverse-chronological) and individual post pages. Posts support headings, code blocks, images, and links. Content includes builder thinking (perspectives on technology, agentic design, the changing craft of software) alongside project writeups — per BRD content scope. | US-3, US-4 | Blog |
| **FR-5** | The site surfaces contact information on every page (header, footer, or persistent element) with clear links to LinkedIn, GitHub, and email. | US-2 | Contact mechanism |
| **FR-6** | The site offers a downloadable PDF CV, reachable in at most two clicks from any page. | US-1 | CV / resume download |
| **FR-7** | The site includes humor, jokes, games, or easter eggs distributed across the experience in ways that do not interfere with serious use (recruiter scan, blog reading). | US-6 | Humor & easter eggs |
| **FR-8** | The site renders and functions correctly on modern mobile, tablet, and desktop viewports. | US-7 | Responsive / mobile-friendly |
| **FR-9** | The site collects lightweight analytics sufficient to report the three BRD KPIs: return-visitor ratio, average session duration, and unique visitors per month. Analytics must respect visitor privacy (no third-party ad trackers). | *(non-user-facing; supports BRD KPIs)* | Basic analytics |
| **FR-10** | Every shareable URL (landing page, blog post, portfolio project) produces a rich social preview (Open Graph / Twitter Card) when pasted into Slack, LinkedIn, or email — with a title, description, and image. | US-9 | *(derived from Recruiter "share" action in BRD audience table)* |
| **FR-11** | The site communicates what kinds of projects or collaborations Jirka is open to — either on the bio page, the portfolio page, or a dedicated "work with me" section. | US-8 | Bio / Portfolio |

**Coverage check.** Every in-scope item from [BRD.md:57-66](BRD.md#L57-L66) is covered by at least one FR. Every user story US-1 through US-11 is served by at least one FR. Out-of-scope items (user accounts, payments) deliberately have no corresponding FR.

## Non-functional Requirements

Non-functional requirements describe *how well* the site must behave. They apply across all functional requirements.

| ID | Requirement |
|---|---|
| **NFR-1 — Performance** | The site is fast by default: static assets, no heavy third-party scripts, no tracking bloat. No hard numeric budget is committed at v1 (honest for a pre-launch solo project), but the site must feel instant on a modern connection. |
| **NFR-2 — Accessibility** | The site uses semantic HTML (proper heading hierarchy, landmarks), provides alt text on meaningful images, is fully keyboard navigable, and has visible focus states. No formal WCAG compliance claim is made at v1, but nothing should be actively hostile to assistive tech. |
| **NFR-3 — Browser support** | The site must render and function on the latest two versions of Chrome, Firefox, Safari, and Edge — explicitly including **mobile Safari** and **Chrome on Android**, since traffic is expected to arrive largely from LinkedIn and similar mobile-heavy referrers. |
| **NFR-4 — Privacy: no third-party trackers** | The site must not load third-party ad or tracking scripts (Google Analytics ads, Facebook Pixel, etc.). Analytics, if used, must come from a privacy-respecting provider or be self-hosted. |
| **NFR-5 — Privacy: no cookie banner** | The analytics solution must not require a GDPR cookie consent banner. This means no cookies that require consent, or analytics that work without cookies at all (e.g. Plausible, Simple Analytics, self-hosted). |
| **NFR-6 — Privacy: no personal data collection** | The site collects no personal data beyond aggregate, anonymized analytics. No forms that store visitor data server-side, no account creation (already out of scope per BRD). |
| **NFR-7 — Maintainability** | Content (blog posts, portfolio entries, bio copy) must be editable without a CMS — directly in source files (markdown or similar) — so Jirka can publish a post or update the bio in a single commit. *(Directly mitigates the BRD "Jirka will keep writing" assumption: low friction means higher chance of continued content production.)* |
| **NFR-8 — Future extendability** | v1 is a static site and ships as one. However, architectural decisions made in v1 must not foreclose the later addition of a backend (API routes, server-rendered pages, dynamic features). This is **not** backend-readiness: v1 must not introduce speculative abstractions, mock APIs, or database layers for features that don't exist. It **is** a constraint on stack and structure: choose technologies, frameworks, and file layouts that can later accommodate server-side code without a rewrite. Concretely — prefer a stack where adding an API route is a known, documented path (e.g. Next.js, Astro, SvelteKit) over a pure HTML/CSS site that would need to be re-platformed to gain a backend. Avoid hard-coding assumptions that only hold for a static site (build-time-only data fetching patterns that can't be swapped for runtime calls, routing that can't be extended, etc.). Specific future possibilities that inform this constraint: (a) an AI-powered interactive feature demonstrating builder capability, (b) a JSON API endpoint exposing site content for agent consumption (see BRD future direction). |
| **NFR-9 — Agent-friendliness** | The site should be consumable by AI agents, not just human visitors. In v1 this means: semantic HTML structure, comprehensive Open Graph and structured data markup (JSON-LD or similar), and clean, crawlable content hierarchy. No dedicated API endpoint is required in v1, but the content structure should make adding one trivial. This is the v1 foundation for the BRD's digital avatar vision — the site evolves toward actively advertising its capabilities and exposing structured endpoints for agent consumption (US-12, v2+). In v1, agents can passively read the structured HTML; in v2+, the site becomes a self-describing service following patterns like MCP (Model Context Protocol) capability discovery. |

## Acceptance Criteria

Acceptance criteria are grouped by user story ID. Each criterion is an observable, testable statement. A user story is "done" when all its ACs pass.

**US-1 — Hiring manager downloads CV**
- [ ] **AC-1.1** A link or button labeled "CV", "Resume", or equivalent is reachable from any page in at most two clicks.
- [ ] **AC-1.2** Clicking the link downloads (or opens in a new tab) a PDF file.
- [ ] **AC-1.3** The PDF contains current role, experience, and contact info.

**US-2 — Any visitor contacts Jirka**
- [ ] **AC-2.1** Every page exposes contact entry points (LinkedIn, GitHub, email) in a consistent location (header, footer, or persistent element).
- [ ] **AC-2.2** Each contact link works: LinkedIn and GitHub open the correct profiles; the email link opens a mail client or reveals the address.
- [ ] **AC-2.3** Contact entry points are reachable within 5 seconds of landing on any page, without scrolling past multiple sections.

**US-3 — Visitor reads a specific blog post**
- [ ] **AC-3.1** Every blog post has a stable, shareable URL.
- [ ] **AC-3.2** Post pages render headings, paragraphs, code blocks, images, and links with legible typography on desktop and mobile.
- [ ] **AC-3.3** No modal, popup, banner, or ad interrupts reading.

**US-4 — Return visitor checks what's new**
- [ ] **AC-4.1** The landing page shows the most recent blog posts and/or portfolio projects (at least the top 3).
- [ ] **AC-4.2** Each item on the landing page shows enough metadata (title, date, or short description) to tell whether it's new since the last visit.
- [ ] **AC-4.3** The full blog index is reachable in one click from the landing page.

**US-5 — Peer engineer browses portfolio**
- [ ] **AC-5.1** The portfolio section lists at least 3 projects (or a single "in progress" note if fewer are ready at launch).
- [ ] **AC-5.2** Each project entry has a short writeup explaining what it is and why it matters.
- [ ] **AC-5.3** Where applicable, project entries link to source code (GitHub) or a live demo.

**US-6 — Visitor enjoys humor & easter eggs**
- [ ] **AC-6.1** At least one explicit humor element (joke, pun, playful copy) is present in the bio or landing page.
- [ ] **AC-6.2** At least one easter egg (hidden interaction, surprise, game) exists somewhere on the site.
- [ ] **AC-6.3** No humor element breaks or overrides serious use of the site (CV download, blog reading, contact paths).

**US-7 — Visitor uses site on mobile**
- [ ] **AC-7.1** On viewports from 360px to 1920px wide, all text is legible without horizontal scrolling.
- [ ] **AC-7.2** All interactive elements (links, buttons, navigation) are tap-friendly on mobile.
- [ ] **AC-7.3** The site renders correctly on mobile Safari (iOS) and Chrome (Android) latest two versions per NFR-3.

**US-8 — Collaborator proposes a project**
- [ ] **AC-8.1** Somewhere on the site (bio, portfolio, or dedicated section), Jirka communicates what kinds of projects, domains, or collaborations interest him.
- [ ] **AC-8.2** That information is reachable in at most two clicks from the landing page.

**US-9 — Recruiter shares the site**
- [ ] **AC-9.1** The landing page, blog posts, and portfolio project pages each expose Open Graph and Twitter Card metadata (title, description, image).
- [ ] **AC-9.2** Pasting a URL from the site into Slack or LinkedIn produces a rich preview with title, description, and a non-broken image.

**US-10 — Visitor reads personal story**
- [ ] **AC-10.1** A dedicated bio / personal-story page exists, reachable in one click from the landing page.
- [ ] **AC-10.2** The bio content is narrative prose — not a bulleted resume dump.
- [ ] **AC-10.3** The bio reflects Jirka's voice (consistent with the BRD qualitative goal "reflects Jirka's voice & humor").

**US-11 — Recruiter evaluates quickly**
- [ ] **AC-11.1** The landing page or bio page displays Jirka's current role and a seniority signal (years of experience, titles, or equivalent) above the fold on desktop and within the first screen on mobile.
- [ ] **AC-11.2** The portfolio surfaces selected/highlighted work first, so a visitor scanning for 60 seconds sees strongest evidence of competence without scrolling through everything.
- [ ] **AC-11.3** A recruiter unfamiliar with Jirka can answer "what does he do, how senior is he, and is his work any good?" within 60 seconds of landing, without needing to download the CV.

**v1 launch gate.** The site is ready to launch when every AC above is checked, analytics per FR-9 is collecting data, and the site has been smoke-tested on each browser/viewport combination listed in NFR-3.

## Dependencies & Milestones

### Dependencies

v1 has **no hard external dependencies**. Domain, hosting, analytics provider, and initial content are all treated as part of the work itself, not as external blockers — Jirka is the sole person responsible for each, and decisions on them are made during the Skeleton and Content milestones below.

### Milestones

Milestones are ordered but not dated. Each milestone has an explicit exit gate: you cannot enter the next milestone until the current one's gate is met. This sequencing directly mitigates the BRD risk *"over-engineering delays launch"* — polish is the **third** milestone, not scattered throughout.

| # | Milestone | Scope | Exit gate |
|---|---|---|---|
| **M1** | **Skeleton** | All pages from FR-1 through FR-6 exist as stubs with placeholder content. Navigation works. Site deploys to chosen hosting on a real domain. | All pages are reachable via real URLs; nav and internal links work; site is live (even if ugly and empty). |
| **M2** | **Content** | Real content fills the skeleton: narrative bio (US-10), at least 3 portfolio projects (US-5), at least 1–2 blog posts (US-3, US-4), working CV PDF (US-1), working contact links (US-2), "what I'm open to" copy (US-8). | Every AC for US-1, US-2, US-3, US-4, US-5, US-8, US-10 passes. Site could reasonably be shown to a recruiter at this stage. |
| **M3** | **Polish** | Humor and easter eggs (US-6, FR-7), Open Graph / social previews (US-9, FR-10), mobile refinement (US-7), analytics wired up (FR-9), NFRs verified (accessibility, browser support, privacy). | Every remaining AC passes. Launch gate from the Acceptance Criteria section is met. |
| **M4** | **Launch** | Public announcement and referral traffic begins (LinkedIn, GitHub profile, etc. per the BRD referral-traffic assumption). | Site is publicly shared; analytics is recording baseline data for the three KPIs. |

**Shipping discipline.** If at any point a task doesn't fit a clear FR or AC, it's out of v1 — log it for v2 rather than expanding scope. This is the concrete enforcement of the BRD over-engineering risk mitigation.