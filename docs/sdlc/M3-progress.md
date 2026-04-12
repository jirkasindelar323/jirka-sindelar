# M3 Progress — Polish Milestone

**Status:** In progress
**PRD reference:** [M3 milestone in PRD.md](PRD.md#milestones)
**Exit gate:** Every remaining AC passes. Launch gate from the Acceptance Criteria section is met.

---

## Scope

Humor and easter eggs (US-6, FR-7), Open Graph / social previews (US-9, FR-10), mobile refinement (US-7), analytics wired up (FR-9), NFRs verified (accessibility, browser support, privacy).

## ✅ Done

*(nothing yet)*

## 🧑 Content work — only Jirka can do

- [ ] **Humor element on bio or landing page** — at least one joke, pun, or playful copy. (US-6, AC-6.1, FR-7)
- [ ] **Easter egg idea** — what hidden interaction or surprise do you want? Needs to exist somewhere on the site without breaking serious use. (US-6, AC-6.2, AC-6.3)

## 🤖 Code work — to do with Claude

- [ ] **OG / social previews** — verify landing page, blog posts, and project pages each expose OG + Twitter Card metadata with title, description, and image. Test by pasting URLs into Slack/LinkedIn. (US-9, AC-9.1, AC-9.2, FR-10)
- [ ] **Mobile refinement** — test all pages on viewports 360px–1920px. All text legible, no horizontal scroll, tap-friendly links/buttons. (US-7, AC-7.1, AC-7.2)
- [ ] **Mobile Safari + Chrome Android** — smoke-test on latest two versions. (US-7, AC-7.3, NFR-3)
- [ ] **Analytics** — wire up a privacy-respecting analytics provider (no cookie banner, no third-party trackers). (FR-9, NFR-4, NFR-5, NFR-6)
- [ ] **Accessibility check** — semantic HTML, alt text, keyboard navigation, visible focus states. (NFR-2)
- [ ] **Browser support** — latest two versions of Chrome, Firefox, Safari, Edge. (NFR-3)
- [ ] **Easter egg implementation** — build whatever Jirka decides on. (US-6, AC-6.2)

## Suggested order

1. **OG / social previews** — already partially done from M2 audit, just needs verification with real URLs.
2. **Mobile refinement** — test and fix any layout issues.
3. **Analytics** — pick a provider, wire it up.
4. **Humor + easter egg** — Jirka decides what, Claude builds it.
5. **Accessibility + browser support** — final NFR sweep.
6. **M3 exit-gate verification** — walk every remaining AC.

## Out of scope for M3

- AWS deployment + GitHub Actions CI/CD — M4
- Agent capabilities (US-12) — v2
- Additional blog posts or projects — whenever Jirka is ready

## Notes

- M2 completed 2026-04-12. All US-1, US-2, US-3, US-4, US-5, US-8, US-10 ACs pass.
- Don't let Claude propose features that aren't in the PRD. The "shipping discipline" rule at the end of PRD.md is binding.
