# M1 Progress — Skeleton Milestone

**Status:** Complete
**PRD reference:** [M1 milestone in PRD.md](PRD.md#milestones)
**Exit gate:** All pages are reachable via real URLs; nav and internal links work; site is live (even if ugly and empty).

---

## Scope

All pages from FR-1 through FR-6 exist as stubs with placeholder content. Navigation works. Site deploys to chosen hosting on a real domain.

## ✅ Done

### Pages (FR-1 through FR-6)

- [x] **Landing page** (`src/pages/index.astro`) — Hero, entry points to bio/portfolio/blog, recent posts and projects. (FR-1)
- [x] **About / bio page** (`src/pages/about.astro`) — dedicated personal-story page. (FR-2)
- [x] **Projects index** (`src/pages/projects/index.astro`) — portfolio section listing projects. (FR-3)
- [x] **Blog index** (`src/pages/blog/index.astro`) — reverse-chronological post listing. (FR-4)
- [x] **Blog post pages** (`src/pages/blog/[...slug].astro`) — individual post rendering with typography. (FR-4)
- [x] **Contact links in Footer** — LinkedIn, GitHub, X, Email on every page. (FR-5)
- [x] **CV download in Footer** — "Download CV" links to `/jiri-sindelar-cv-short.pdf`. (FR-6)
- [x] **404 page** (`src/pages/404.astro`)
- [x] **Tags pages** (`src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`)

### Navigation

- [x] **Header nav** — Home, About, Projects, Blog links on every page.
- [x] **Mobile menu** — hamburger toggle on small viewports.
- [x] **Internal links work** — all nav links resolve to real pages.

### Infrastructure

- [x] **Astro 6 + Tailwind v4 + React** — stack chosen and configured.
- [x] **Content collections** — blog and projects with Zod-validated frontmatter.
- [x] **Layouts** — BaseLayout (HTML shell, Header, Footer, SEO, dark mode) and BlogPostLayout.
- [x] **Dark mode** — class strategy with localStorage persistence.
- [x] **Sitemap** — `@astrojs/sitemap` generates `sitemap-index.xml` at build.
- [x] **robots.txt** — with AI crawler blocklist.
- [x] **Production build passes** — `astro build` completes, 6 pages generated.

### Not done

- [ ] **Site live on real domain** — `jirkasindelar.dev` is configured in `astro.config.mjs` but no GitHub Actions workflow exists and no AWS deployment is set up yet. Site is not live.

## Exit gate assessment

**Partial pass.** All pages exist, navigation works, build succeeds. The site is not yet deployed to a real domain — the exit gate says "site is live (even if ugly and empty)." Deployment (AWS S3 + CloudFront + GitHub Actions) is listed in M2-progress.md as out of scope for M2, so it has been deferred.

## Notes

- M1 was completed across earlier sessions before progress tracking docs existed. This file is a retroactive record.
- Deployment is the only gap. All other M1 requirements are met.
