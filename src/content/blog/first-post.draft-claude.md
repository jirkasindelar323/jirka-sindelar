---
title: "Building website"
description: "Make Claude work like an architect would teach you."
date: 2026-04-11
tags: ["claude code", "ai", "learning", "sdlc"]
draft: true
---
 

I had BRD, PRD, Technology Decisions, SDD. All done. I was like — let's go, let's build the website. I wanted something small first, something I can understand fully.

But Claude was like: *"Do you want me to build the content collections, the SEO setup, the full Astro project directory we drafted in SDD?"* And I was like — stop. First let me understand what Astro actually is. I'll do the tutorial. Navigate me, but I want to learn during the process. Don't just build the monster.

So I stopped Claude and asked it to make a rule for itself. Something like: there is a decision to make → propose what's next → don't execute until I say go. The rule is in Claude's memory now, not in my repo. It's basically how an architect would teach a junior: what needs to be decided, why it matters, full landscape of options, discussion, I decide, and then we implement — together or separately.

It didn't work right at the start. Claude would still pre-filter options, attach "Recommended" labels, push me toward the cleanest path. I pushed back. We tuned each other over a few sessions and now it actually feels like collaboration. I'm learning how decisions get made, not just collecting working code I don't understand.

The simple version of what I figured out: **tell Claude you want to learn, and let it do the boring part.**

But "boring" isn't one thing. There are two flavors I noticed.

**Execution boring.** I already know what to do, I just don't want to type it. *"Link my CV in the footer along the existing links."* I know what the footer looks like. I know the pattern. Claude does it in five seconds, I check the diff, done. No learning lost — there was nothing to learn.

**Research boring.** There's a definite answer somewhere, finding it is grunt work. Astro v6 changed a default behavior. My build was broken. I didn't want to dig through the changelog for an hour. Claude found it: `output: 'static'` in `astro.config.mjs`. One line. The fix is trivial — the value was in the search, not the typing.

What is *not* boring, and what I never let Claude do: **the parts where the answer doesn't exist yet.** Decisions. Trade-offs. Why this rendering strategy and not another one. Why Astro and not Next.js. What the website is even for. Those are the parts where I'm becoming an architect — or not — depending on whether I do the thinking myself.

So the rule under the rule:

- **Answer exists in my head as a pattern → Claude can do it.**
- **Answer exists in the docs / changelog / GitHub → Claude can find it.**
- **Answer doesn't exist yet → I do it. That's the part I came here for.**

This is also the trap of AI for builders right now. It's *so easy* to let it do everything that you skip the thinking and end up with a working repo and nothing in your head. The code is on disk, the understanding is missing. Working garbage.

I'm not saying don't use Claude Code. I use it every day — I'm using it to write this post. I'm saying: tell it what you want to learn, draw the line between "exists somewhere" and "doesn't exist yet," and protect the second one with both hands.
