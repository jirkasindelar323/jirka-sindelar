
## 1\. BRD — Business Requirement Document

## Vision

**North star:** Build a personal website that establishes Jirka Sindelar's brand and credibility as a software engineer — a place visitors remember, trust, and want to reconnect with.

Success means that, after visiting the site, each of the following reactions becomes plausible:

- *"Recruiter comes to the website and says: 'I want to employ this guy — this is exactly how a software engineer's website should look!'"*
- *"Employer comes to the website and says: 'I want to hire this guy!'"*
- *"Software Engineer comes to the website and says: 'I want to work with this guy!'"*
- *"Anyone comes to the website and says: 'I want to employ him, work with him, or be his friend.'"*

## Target Audiences

The site is designed for **two audiences**. The **primary success outcome across both is retention** — visitors should want to come back, not just view once. Each audience has a feel (what they should take away emotionally) and a do (the concrete action that signals success).

| Audience | Who they are | Should feel… | Should do… |
|---|---|---|---|
| **Tech Industry People** ⭐ *primary* | People Jirka meets in professional tech contexts — conferences, meetups, industry events — including engineers of any seniority, product managers, product owners, founders, and business-side people in tech. The primary acquisition channel is an in-person meeting followed by a mobile visit within minutes, hours, or days. | "That's an interesting guy." Respect, curiosity, and a sense that this person has taste, voice, and craft. | Remember Jirka positively, look up his work or writing later, and return when something new is posted. Optionally reach out for collaboration or a conversation. |
| **Recruiters** | HR, tech recruiters, and hiring managers evaluating Jirka for a role. Usually arrive via LinkedIn or a shared link, rarely via an in-person meeting. Hiring managers in tech who meet Jirka in person are treated as Tech Industry People, not Recruiters. | "This is exactly how a software engineer's website should look." Professional, distinctive, instantly credible. | Initiate contact, download and forward the CV, share the site with a hiring team, or return when a relevant role opens. |

## Stakeholder list

- Product Owner: Jirka Sindelar
- Client: Jirka Sindelar
- Business Analyst: Jirka Sindelar
- CTO: Jirka Sindelar

## Executive Summary

This project builds a personal website for Jirka Sindelar whose purpose is to establish his brand and credibility as a software engineer — a place visitors remember, trust, and want to reconnect with. It serves two audiences: **Tech Industry People** (engineers, PMs, POs, founders, and tech-business folks Jirka meets at conferences, meetups, and industry events — the primary audience) and **Recruiters**. The primary acquisition channel is Jirka attending tech events and either showing the site in person or sharing the link afterward; most first visits happen on mobile within hours of an in-person meeting. Content is a mix of bio, portfolio, long-form writing, and personality-driven humor. Success is measured primarily by retention: return-visitor ratio, average session duration, and unique visitors per month, backed by qualitative goals around voice, memorability, calm design, and visible craft. V1 is a responsive static site with blog, portfolio, contact mechanism, CV download, and basic analytics; user accounts are out of scope for v1, and payments or monetization of any kind are permanently excluded — the site will never carry them. The main risk is over-engineering delaying launch, and the project rests on two assumptions: that traffic will arrive via referral rather than SEO, and that Jirka will continue writing after launch.

## Business Goals & KPIs

### Qualitative Goals

- **Reflects Jirka's voice & humor** — the site should sound unmistakably like its author, not a generic portfolio template.
- **Memorable & distinctive** — visitors should remember it later; it should stand out from typical engineer portfolios.
- **Clean & non-distracting** — personality without visual noise; calm, focused, easy to read.
- **Shows genuine craft** — the site itself is evidence of engineering taste, not just claims about it.

### Measurable KPIs

The site's primary business outcome is retention, so KPIs lean toward engagement rather than raw reach. No numeric targets are committed at this stage — baselines will be established after launch.

- **Return-visitor ratio** — % of visitors who come back more than once. *Primary KPI* (direct retention signal).
- **Average session duration** — how long visitors spend on the site, as a proxy for whether content and humor hold attention.
- **Unique visitors per month** — top-of-funnel reach; contextualizes the two retention metrics above.

## In-scope / Out-of-scope

### In scope (v1)

- **Bio / personal story** — narrative "about me" covering who Jirka is, how he got here, and what he cares about.
- **Portfolio of work** — selected projects, case studies, or work samples with short writeups.
- **Blog / thoughts** — long-form writing area; the primary driver of return visits and the retention KPI. Content includes not just project writeups but **builder thinking** — Jirka's perspectives on technology, agentic design, AI as augmented intelligence, and how the craft of building software is changing. This type of content is what makes the site distinctive: it demonstrates the "interesting guy" impression through how Jirka thinks, not just what he's built.
- **Humor & easter eggs** — jokes, games, hidden surprises; the personality layer explicitly called out in the Vision.
- **Contact mechanism** — clear links to LinkedIn/GitHub.
- **CV / resume download** — downloadable PDF for recruiters who want to forward it.
- **Responsive / mobile-friendly** — works cleanly on phone, tablet, and desktop.
- **Basic analytics** — lightweight tracking sufficient to measure return-visitor ratio, session duration, and unique visitors.

### Out of scope (v1)

- **User accounts / login** — no authentication, no profiles; the site is fully public and stateless.
- **Payments / monetization** — no Stripe, donations, or paid content. This is a permanent exclusion, not a v1 deferral: the site will never carry monetization features. Any future "paid" relationship with Jirka happens outside the website.

### Future direction (not v1, but informing architectural choices)

- **Agent-friendly site.** As AI agents increasingly mediate how people discover and consume content (see [3_AGENTIC_DESIGN.md](../learning/3_AGENTIC_DESIGN.md)), the site should be consumable by agents — not just human visitors. In practice this means structured metadata and potentially a simple API endpoint that exposes content (bio, portfolio, blog posts) in a machine-readable format. This is low effort in v1 (structured HTML, good meta tags, semantic markup) with the option to add a dedicated JSON endpoint later. The site itself becomes a demonstration of the builder thinking Jirka writes about: if apps become APIs, a personal site should be agent-friendly too.
- **Interactive AI features.** The site could eventually include a conversational element or AI-powered feature that demonstrates Jirka's understanding of agentic technology — not as a gimmick, but as evidence of builder capability. This is a v2+ consideration that informs the NFR-8 extendability requirement: the stack should accommodate a future backend with API routes.

## Risks & Assumptions

### Risks

- **Over-engineering delays launch.** The author is an engineer and may keep polishing the code, stack, or design instead of shipping. Mitigation: treat the v1 scope list above as a hard boundary and launch when every in-scope item is functional, even if imperfect.

### Assumptions

- **Traffic arrives via referral, not SEO.** Visitors are assumed to come from LinkedIn, GitHub, word-of-mouth, or direct shares — not Google search. No SEO investment is planned; if this assumption breaks, the traffic KPI will need rethinking.
- **Jirka will keep writing.** The blog section and the retention KPI both depend on ongoing content production after launch. Without continued writing, return-visitor ratio cannot grow and the site degrades over time.