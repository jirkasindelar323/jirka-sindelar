# M2 Progress — Content Milestone

**Status:** In progress
**PRD reference:** [PRD.md:154](PRD.md#L154)
**Exit gate:** Every AC for US-1, US-2, US-3, US-4, US-5, US-8, US-10 passes.

---

## ✅ Done

- [x] CV PDF in `public/jiri-sindelar-cv-short.pdf`, linked from Footer (US-1, AC-1.1–1.3)
- [x] Contact links in Footer: LinkedIn, GitHub, email (US-2, AC-2.1–2.3)
- [x] `robots.txt` with AI crawler blocklist
- [x] `@astrojs/sitemap` integration (generates `sitemap-index.xml` at build)
- [x] OG image (`public/og-image.jpg`, 637KB) referenced in `BaseLayout.astro`
- [x] `@tailwindcss/typography` plugin installed; `prose dark:prose-invert` wrapping `<Content />` in `BlogPostLayout.astro`
- [x] Dark mode confirmed working with prose

## 🧑 Content work — only Jirka can do

These are the M2 blockers. None are code — they're writing in Jirka's voice.

- [ ] **Real narrative bio** in [src/pages/about.astro](../../src/pages/about.astro) — story beyond a resume (US-10, AC-10.2)
- [ ] **"What I'm open to" copy** — what kinds of projects/collaborations interest Jirka (US-8, AC-8.1, FR-11)
- [ ] **Seniority signal text** — current role + years of experience for the landing hero (FR-1, AC-11.1)
- [ ] **3+ portfolio projects** as markdown files in [src/content/projects/](../../src/content/projects/) (US-5, AC-5.1)
- [ ] **1–2 blog posts** as markdown files in [src/content/blog/](../../src/content/blog/) (US-3, US-4)

## 🤖 Code work — do with Claude

**Order matters:** content first, code second. Building components before content forces Jirka's voice into Claude-shaped placeholders.

- [ ] **A. Build `Hero.astro`** for landing page — name, role, seniority signal (FR-1, US-5, US-11). Planned in [SDD.md:265](SDD.md#L265). Currently `index.astro` still has tutorial content.
  - **Blocked on:** seniority signal text (above)
- [ ] **B. Wire recent posts and projects on landing page** (FR-1, AC-4.1, AC-4.3) — needs `getCollection` calls and `BlogCard`/`ProjectCard` components on `index.astro`.
  - **Blocked on:** at least 1 real post and 1 real project
- [ ] **C. Audit per-post OG metadata in `BlogPostLayout`** — does it emit per-post `og:title` / `og:description` / `og:image` or only defaults? *(Strictly an M3 item under AC-9.1, but cheap to check now while we're in the layout file.)*

## Suggested order for tomorrow

1. Write seniority signal text (one or two sentences). Smallest unblock.
2. Build `Hero.astro` together (task A) using the real text.
3. Write the bio (US-10).
4. Write the "what I'm open to" copy (US-8).
5. Write at least one project markdown file.
6. Write at least one blog post markdown file.
7. Wire up the landing page together (task B).
8. M2 exit-gate verification: walk every AC for US-1, 2, 3, 4, 5, 8, 10.

## Out of scope for M2 — log for later

- Hero **images on blog posts** — not in PRD; Claude proposed it in error during the previous session. Not doing it.
- Easter egg / humor (FR-7, US-6) — M3
- Per-post OG tags as a hard requirement (AC-9.1) — M3
- Mobile testing across viewports (AC-7.1–7.3, NFR-3) — M3
- Analytics (FR-9) — M3
- AWS deployment + GitHub Actions CI/CD — post-M3

## Notes for tomorrow's session

- Don't let Claude propose features that aren't in the PRD. The "shipping discipline" rule at [PRD.md:158](PRD.md#L158) is binding.
- The blockers right now are **words on pages**, not engineering. Astro pipeline, schemas, typography, dark mode, sitemap, robots, CV, contact, OG image — all working.
