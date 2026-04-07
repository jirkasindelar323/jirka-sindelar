
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

- **Digital avatar — the site as Jirka's augmented self.** The long-term vision is that the website IS Jirka's digital avatar — an augmented version of himself that can introduce itself and communicate with both humans and agents. The same way Jirka would introduce himself at a conference ("I'm Jirka, I'm a builder, here's what I think about, here's what I've done, here's what I'm interested in"), the avatar does the same — in HTML for humans, in structured protocol for agents.

  The key idea: **anyone can easily connect their agent to the avatar.** A recruiter's personal agent, a collaborator's assistant, a conference organizer's tool — they discover the avatar, it advertises what it can provide ("I can tell you about Jirka's work, his thinking on agentic design, his background, whether he's open to collaboration"), and the conversation happens. This follows the same pattern as MCP (Model Context Protocol) where a server advertises capabilities and agents discover and use them.

  The avatar has a **soul.md** — an explicit definition of identity, values, voice, and perspective that shapes how it represents Jirka. For humans, the soul is implicit (expressed through the site's tone, humor, design). For agents, the soul is explicit — it's what makes the avatar feel like talking to Jirka rather than querying a database. The soul.md encodes: builder identity, values (honesty over polish, craft over speed, understanding over just picking), voice, perspective on technology and building, and boundaries (what the avatar won't pretend to know).

  The evolution path:
  - **v1:** Static site for humans. Structured markup, semantic HTML, JSON-LD — the avatar speaks to humans; agents can read the structured HTML passively. The soul exists implicitly in the site's voice, content, and design.
  - **v2:** API + capability discovery + soul.md. The avatar advertises what it can provide and exposes structured endpoints. The soul.md becomes a first-class component — shaping how the avatar communicates, not just what data it serves. Any agent can connect and ask questions.
  - **v3:** Conversational avatar. An AI agent that represents Jirka's perspective — answers questions, synthesizes across his content, engages in dialogue with both humans and other agents. The soul.md guides the avatar's personality, tone, and judgment in conversations.
  
  This future direction is concrete enough to inform architectural choices (the stack must support API routes, capability discovery, and eventually server-side AI logic) but is NOT v1 scope. See [3_AGENTIC_DESIGN.md](../learning/3_AGENTIC_DESIGN.md) for the thinking behind this.

## Risks & Assumptions

### Risks

- **Over-engineering delays launch.** The author is an engineer and may keep polishing the code, stack, or design instead of shipping. Mitigation: treat the v1 scope list above as a hard boundary and launch when every in-scope item is functional, even if imperfect.

### Assumptions

- **Traffic arrives via referral, not SEO.** Visitors are assumed to come from LinkedIn, GitHub, word-of-mouth, or direct shares — not Google search. No SEO investment is planned; if this assumption breaks, the traffic KPI will need rethinking.
- **Jirka will keep writing.** The blog section and the retention KPI both depend on ongoing content production after launch. Without continued writing, return-visitor ratio cannot grow and the site degrades over time.