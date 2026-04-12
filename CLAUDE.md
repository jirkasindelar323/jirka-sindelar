# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Jirka Sindelar at jirkasindelar.dev. Static site built with Astro 6, React (for islands), Tailwind CSS v4, and deployed to AWS S3 + CloudFront. No backend, no database — content is markdown files rendered at build time.

## Commands

- `npm run dev` — start dev server (hot reload)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- No test framework is configured

## Architecture

**Astro Islands pattern**: everything renders to static HTML by default. React components only hydrate when using `client:` directives (currently only planned for easter egg interactivity). Blog posts and project pages ship zero JavaScript.

**Content Collections** (`src/content.config.ts`): two collections with Zod-validated frontmatter:
- `blog/` — posts with title, description, date, tags, draft flag. Drafts are filtered out at query time (`!data.draft`), not by file convention.
- `projects/` — portfolio entries with title, description, tags, sourceUrl, liveUrl, featured flag, order.

**Layouts**: `BaseLayout.astro` wraps every page (HTML shell, Header, Footer, SEO meta, dark mode script). `BlogPostLayout.astro` extends it with post metadata and `prose` typography.

**Styling**: Tailwind v4 via Vite plugin (not PostCSS). Global CSS at `src/styles/global.css` uses `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`. Dark mode uses class strategy with custom variant `@custom-variant dark (&:where(.dark, .dark *))`.

**SEO/Agent layer**: `SEOHead.astro` handles OG/Twitter meta tags. `JsonLd.astro` emits schema.org structured data (Person, BlogPosting). Sitemap generated via `@astrojs/sitemap` integration.

## Key Conventions

- Site URL is `https://jirkasindelar.dev` (configured in `astro.config.mjs`)
- File-based routing in `src/pages/`; dynamic blog routes use `[...slug].astro`
- Node.js >= 22.12.0 required (see `engines` in package.json)
- TypeScript strict mode (extends `astro/tsconfigs/strict`); JSX configured for React
- Static output only (`output: 'static'` in astro config) — no SSR

## Deployment

GitHub Actions: push to main triggers `npm ci` → `astro build` → `aws s3 sync` → CloudFront invalidation. IAM credentials stored as GitHub Secrets.

## Design Documents

Detailed architecture, requirements, and technology decisions live in `docs/sdlc/` (SDD.md, BRD.md, PRD.md, Technology Decisions.md). Consult these for the "why" behind decisions.
