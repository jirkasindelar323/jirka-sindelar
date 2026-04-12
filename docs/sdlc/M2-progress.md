# M2 Progress — Content Milestone

**Status:** Complete
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

- [x] **Hero copy in [Hero.astro](../../src/components/Hero.astro)** — replaced placeholder with meetup-energy one-liner + photo. (FR-1, US-5)
- [x] **Real narrative bio** in [src/pages/about.astro](../../src/pages/about.astro) — story section with Prague → Melbourne arc, grandpa quote, in Jirka's voice. (US-10, AC-10.2)
- [x] **"What I'm open to" copy** — specific enough to self-qualify: Open Banking, agentic design, product development. (US-8, AC-8.1, FR-11)
- [x] **Portfolio projects** — shipping with 2 projects (personal-site, mortgage-readiness-copilot). Copyedited mortgage-readiness-copilot.md (fixed typos, removed repetition). 3rd project deferred — no proprietary bank work to showcase. (US-5, AC-5.1)
- [x] **Blog posts** — [first-post.md](../../src/content/blog/first-post.md) marked as draft. Blog index shows "Hopefully I'll add blogs soon." empty state. Real posts deferred until Jirka is ready to write. (US-3, US-4)

## 🤖 Code work — to do with Claude

- [x] **Audit per-post OG metadata in `BlogPostLayout`** — confirmed: each page passes its own title/description to SEOHead. Per-post OG works. Only the OG image is shared (falls back to `/og-image.png`), which is expected.
- [x] **Space Grotesk font** — added as site-wide font via Google Fonts + Tailwind `--font-sans` override.
- [x] **Blog empty state** — blog index shows "Hopefully I'll add blogs soon." when no published posts exist.

## ✅ Exit-gate verification — passed 2026-04-12

All ACs for US-1, US-2, US-3, US-4, US-5, US-8, US-10 verified and passing.

Additional work done during verification:
- Footer redesigned: text labels → SVG icons (GitHub, LinkedIn, X, Email), Instagram removed, "Download CV" label
- Email contact link added (AC-2.1 now fully passes with email)

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
