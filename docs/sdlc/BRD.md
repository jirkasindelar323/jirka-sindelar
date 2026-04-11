
## 1\. BRD — Business Requirement Document

## Vision

**North star:** Build a personal website that recreates, for the visitor who wasn't at the meetup (or who was, and wants to go deeper), the same experience of meeting Jirka in person — the energy, the projects, the opinions, the questions, the story.

### How I show up

At tech event I talk with software engineers, product owners, software start-up owners,... and share with people cool stuff I do, where I see interesting technology or ideas. Share my story of my career and life. Share my philosophy, my curiosity - questions, why I choose Melbourne, why I moved from Prague.

> "Hi man, have you heard about open banking, look I do this project"
>
> "I was like: I want my website. But what technology to choose today and I found Astro, do you know it. I built website with it, and it's easy to use. Look. Yes I used Claude Code, but didn't let it just build, I noticed that if you want also learn from it, it's better to say to Claude that I want learn and let it do the boring part."
>
> "what do you think is the future of software design? What is the role of us there?"

The website is this conversation, frozen in HTML — so the visitor can wander through it the way they would have wandered through the meetup.

### What a successful visit produces

A visit succeeds when one or more of these happen:

- The visitor **remembers** Jirka later — by name, by project, by an idea
- They **come back** when something new is posted
- They **mention Jirka** to a friend or colleague ("you should see what this guy is building")
- They **reach out** — email, LinkedIn, or just a hello at the next event
- They **follow the blog** or subscribe to whatever follow-mechanism exists

## Target Audiences

The site is designed for **two audiences**. The **primary success outcome across both is caught interest** — the visitor's curiosity gets hooked, they keep reading, and they walk away with a *"this is interesting / remarkable"* reaction. Coming back, sharing, or reaching out are valuable but downstream of this — they only happen if the first visit lands. Each audience has a feel (what they should take away emotionally) and a do (the concrete action that signals success).

**Precedence:** Content, design, and copy decisions are driven by **Tech Industry People** only. Recruiter needs are met by the CV download and contact links — *not* by homepage copy, the bio, or the blog. If a decision creates tension between the two audiences, Tech Industry People win by default.

| Audience | Who they are | Should feel… | Should do… |
|---|---|---|---|
| **Tech Industry People** ⭐ *primary* | People Jirka meets in professional tech contexts — conferences, meetups, industry events — including engineers of any seniority, product managers, product owners, founders, and business-side people in tech. The primary acquisition channel is an in-person meeting followed by a mobile visit within minutes, hours, or days. | "That's an interesting guy." Respect, curiosity, and a sense that this person has taste, voice, and craft. | Remember Jirka positively, look up his work or writing later, and return when something new is posted. Optionally reach out for collaboration or a conversation. |
| **Recruiters** | HR, tech recruiters, and hiring managers evaluating Jirka for a role. Usually arrive via LinkedIn or a shared link, rarely via an in-person meeting. Hiring managers in tech who meet Jirka in person are treated as Tech Industry People, not Recruiters. | "This is exactly how a software engineer's website should look." Professional, distinctive, instantly credible. | Initiate contact, download and forward the CV, share the site with a hiring team, or return when a relevant role opens. |

## Stakeholder list

- Product Owner: Jirka Sindelar
- Client: Jirka Sindelar
- Business Analyst: Jirka Sindelar
- CTO: Jirka Sindelar

## Quality Goals & Signals

### Quality Goals

- **Reflects Jirka's voice & humor** — the site should sound unmistakably like its author, not a generic portfolio template.
- **Memorable & distinctive** — visitors should remember it later; it should stand out from typical engineer portfolios.
- **Clean & non-distracting** — personality without visual noise; calm, focused, easy to read.
- **Shows genuine craft** — the site itself is evidence of engineering taste, not just claims about it.

### Signals I'll watch

This is a personal site, not a product with stakeholders. There are no targets and no "primary KPIs" — quantitative metrics on a low-traffic site are too noisy to drive decisions on their own. What follows is what I'd glance at occasionally to sanity-check whether the site is doing its job.

**Qualitative signals (the ones that actually mean something):**

- Someone comes up to me at a meetup and says *"I read your blog post"* or *"I saw your project on open banking"*
- I get an unsolicited email or DM from someone I didn't know
- Someone shares a link to one of my projects or posts
- When I revisit the site six months from now, *I* still think *"this is interesting"*

**Quantitative signals (sanity checks, not targets):**

- Are people reading past the Hero on the landing page? (engagement check)
- Is the most recent blog post getting any traffic at all? (writing-reaches-anyone check)
- Did any visitor land on a deep page (a project or a post) directly from a referral? (validates the meetup-receipt model)

None of these have numbers attached. If something looks off on a glance, it prompts a question — it doesn't trigger an action on its own.

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
- **Pre-filtering by recruiters and ATS is structural and the site cannot fix it.** Cold applications get filtered before anyone clicks through to the site. The site converts *post-curiosity* — the visitor who already met Jirka in person, was pointed at him by someone, or found a blog post via referral. Measuring the site against cold-application outcomes (interview rate, callback rate) will produce false failure signals and risk burnout. Mitigation: judge the site by the retention KPIs above and by qualitative signals from the post-curiosity audience, not by job-application throughput.

### Assumptions

- **Traffic arrives via referral, not SEO.** Visitors are assumed to come from LinkedIn, GitHub, word-of-mouth, or direct shares — not Google search. No SEO investment is planned; if this assumption breaks, the traffic KPI will need rethinking.
- **Jirka will keep writing.** The blog section and the retention KPI both depend on ongoing content production after launch. Without continued writing, return-visitor ratio cannot grow and the site degrades over time.