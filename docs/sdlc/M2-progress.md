# M2 Progress — Content Milestone

**Status:** In progress
**PRD reference:** [M2 milestone in PRD.md](PRD.md#milestones)
**Exit gate:** Every AC for US-1, US-2, US-3, US-4, US-5, US-8, US-10 passes.

---

## Major change this session: BRD/PRD audit

Before resuming content work, the BRD and PRD were audited and rewritten to fix a Game A vs. Game B drift. The site is now positioned as a **meetup-receipt** — the visitor who wasn't at the meetup (or who was, and wants to go deeper) gets the same experience as meeting Jirka in person. The recruiter-led "role + seniority" framing is gone.

- [BRD.md](BRD.md) — new Vision (scene + outcomes), Executive Summary deleted, KPIs replaced with "Signals I'll watch", Recruiters precedence note added under Target Audiences, pre-filtering risk added.
- [PRD.md](PRD.md) — US-11 deleted; AC-11.1 / AC-11.2 / AC-11.3 deleted; FR-1 and FR-2 stripped of recruiter-evaluation language; subtle leaks (product one-liner, use cases #1 and #2, NFR-3) rewritten.

**What this changes for M2:** the seniority-signal blocker is gone. Hero copy is no longer about role + years — it's about meetup energy. Content work below is updated to match.

## ✅ Done

- [x] CV PDF in `public/jiri-sindelar-cv-short.pdf`, linked from Footer (US-1, AC-1.1–1.3)
- [x] Contact links in Footer: LinkedIn, GitHub, email (US-2, AC-2.1–2.3)
- [x] `robots.txt` with AI crawler blocklist
- [x] `@astrojs/sitemap` integration (generates `sitemap-index.xml` at build)
- [x] OG image (`public/og-image.jpg`, 637KB) referenced in `BaseLayout.astro`
- [x] `@tailwindcss/typography` plugin installed; `prose dark:prose-invert` wrapping `<Content />` in `BlogPostLayout.astro`
- [x] Dark mode confirmed working with prose
- [x] **`Hero.astro` exists** as a component (placeholder copy still — see content blockers below)
- [x] **Landing page wired up** — [src/pages/index.astro](../../src/pages/index.astro) calls `getCollection` for blog and projects, sorts by date and featured/order, renders via `BlogCard` and `ProjectCard`. *(Was task B in the previous version of this doc.)*
- [x] **Initial content seeded** — 2 of 3 projects (`personal-site.md`, `mortgage-readiness-copilot.md`) and 1 placeholder blog post (`first-post.md`). Quality of these still TBD — see below.

## 🧑 Content work — only Jirka can do

These are the M2 blockers. None are code — they're writing in Jirka's voice.

- [ ] **Hero copy in [Hero.astro](../../src/components/Hero.astro)** — replace the placeholder (`Software Engineer` / `Builder, learner, writer…`) with the meetup-energy register: voice, projects, "look at this" stance. Not a role + years line. (FR-1, US-5)
- [ ] **Real narrative bio** in [src/pages/about.astro](../../src/pages/about.astro) — story beyond a resume in the meetup-conversation register: who Jirka is, the Java backend → full-stack arc, why Prague → Melbourne, what he's chasing now (US-10, AC-10.2). The current four-fragment placeholder is the right *instinct* in the wrong format — fragments → narrative.
- [ ] **"What I'm open to" copy** — what kinds of projects/collaborations interest Jirka, with enough specificity that a curious engineer can self-qualify ("am I a fit to reach out?"). Current copy is too vague — *"interesting projects"* tells the visitor nothing. (US-8, AC-8.1, FR-11)
- [ ] **3+ portfolio projects** as markdown files in [src/content/projects/](../../src/content/projects/) (US-5, AC-5.1). Currently 2 of 3 — need at least one more. Also: copyedit pass on [mortgage-readiness-copilot.md](../../src/content/projects/mortgage-readiness-copilot.md) (typos like *willigness*, rough grammar).
- [ ] **1–2 real blog posts** as markdown files in [src/content/blog/](../../src/content/blog/) (US-3, US-4). The current [first-post.md](../../src/content/blog/first-post.md) is Astro-tutorial template content and won't pass exit-gate review. **Top candidate post:** the *"tell Claude you want to learn, let it do the boring part"* observation Jirka articulated in this session — a real, earned, specific opinion that's already 80% drafted in his own words.

## 🤖 Code work — to do with Claude

- [ ] **Audit per-post OG metadata in `BlogPostLayout`** — does it emit per-post `og:title` / `og:description` / `og:image` or only defaults? *(Strictly an M3 item under AC-9.1, but cheap to check now while we're in the layout file.)*

*(Tasks A and B from the previous version of this doc — build `Hero.astro` and wire the landing page — are now in the Done section above.)*

## Suggested order

1. **Hero copy** — write the meetup-energy paragraph. Smallest unblock; replaces the deleted "seniority signal text" task as the first item.
2. **First real blog post** — the Claude Code learning observation. Already 80% written from Jirka's own words this session. Capture while the energy is fresh.
3. **Bio** (US-10) — narrative prose, the meetup story, in Jirka's voice. Folds in the Prague → Melbourne thread that's been hiding in the placeholder fragments.
4. **"What I'm open to" copy** (US-8) — specific enough that a curious engineer at a meetup can self-qualify.
5. **Third project** markdown file. Also copyedit `mortgage-readiness-copilot.md`.
6. **Replace [first-post.md](../../src/content/blog/first-post.md)** with the real blog post from step 2 (or delete it if step 2 produced a fresh slug).
7. **M2 exit-gate verification** — walk every AC for US-1, 2, 3, 4, 5, 8, 10.

## Out of scope for M2 — log for later

- Hero **images on blog posts** — not in PRD; Claude proposed it in error during a previous session. Not doing it.
- Easter egg / humor (FR-7, US-6) — M3
- Per-post OG tags as a hard requirement (AC-9.1) — M3
- Mobile testing across viewports (AC-7.1–7.3, NFR-3) — M3
- Analytics (FR-9) — M3
- AWS deployment + GitHub Actions CI/CD — post-M3

## Notes

- Don't let Claude propose features that aren't in the PRD. The "shipping discipline" rule at the end of PRD.md is binding.
- The blockers right now are **words on pages**, not engineering. Astro pipeline, schemas, typography, dark mode, sitemap, robots, CV, contact, OG image, Hero shell, landing-page wiring — all working.
- **Audit lesson worth keeping:** SDLC docs drift quietly when top-level Vision sections aren't kept aligned with the body of the doc. The old BRD Vision (recruiter-flavored reactions) silently contradicted the Target Audiences table for months and infected AC-11.1 in the PRD. Caught through conversation, not metrics. A KPI cannot tell you your North Star is wrong.
