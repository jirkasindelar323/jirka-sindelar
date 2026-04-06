# Agentic Technology Changes How We Design Applications

## The core observation

Classic software and agentic software are fundamentally different interaction models. This isn't about AI making development faster (covered in [2_AI_ACCELERATION.md](2_AI_ACCELERATION.md)). This is about how AI changes **what we build and how we think about designing it.**

If you're an inventor building products with agentic technology, you need to understand the new interaction model — not just use it, but design for it.

## Classic software vs. agentic systems

### How classic software works

User gives well-defined input. System gives deterministic output. The designer's job is to define all allowed actions, build interfaces for them, and handle edge cases. The user adapts to the software — learns the menus, memorizes the shortcuts, works within the constraints.

We did the trade-off: spend significant effort figuring out deterministic algorithmic automation for well-defined problems. The result wasn't smart, but it worked reliably. Users clicked what was allowed and got used to it.

### How agentic systems work

User gives a rough impulse — an intention, a half-formed thought. The system refines it iteratively with the user. The outcome emerges through collaboration. The software adapts to the user's thinking process, not the other way around.

This is closer to how human thinking actually works than anything we've built before. We sharpen our thoughts in multiple steps, we pull in knowledge to fill gaps, we store things to avoid forgetting. An agentic system does the same — it's augmented thinking, not automated execution.

## Two key components of agentic systems

As far as I can tell today, agentic systems have two fundamental components that change the game. Whether these are the only two, or whether there are others I haven't recognized yet — I don't know. But these two are clearly essential.

### 1. Augmented thinking — iterative refinement of human intent

The agent doesn't just execute a command. It engages in a multi-step process of understanding, clarifying, and refining the human's original impulse.

**The sharper the human input, the more valuable the final outcome.** This is a design principle, not just a usage tip. It means:

- The initial human signal matters enormously. A senior who has years of pattern recognition produces a sharper signal — they immediately recall what was easy, what was hard, what's reusable, what the purpose was. That's why the market values seniors: not because they type faster, but because their initial impulse already carries depth and breadth.
- AI can partially close the gap for less experienced people — the knowledge acquisition part accelerates dramatically. But the instant pattern recognition that comes from lived experience isn't something AI gives you; it's something you build by going through the cycles yourself.
- The refinement loop IS the product. In classic software, iteration meant "user retries because it failed." In agentic systems, iteration is the normal mode — the multi-step sharpening process is how value is created. Designing for this loop (how many steps, what checkpoints, how to surface intermediate results) is a core design challenge.

### 2. Tools — executing the augmented mind's intentions

An agent without tools is just a conversation. Tools are what connect the augmented thinking to the real world — they execute the intentions that emerge from the human-agent collaboration.

This is why companies like Anthropic and OpenAI are building agentic browsers, and why tool integrations (MCP servers, APIs, file systems, databases) are central to agent architectures. The agent thinks with you, and then **acts** through tools.

The combination is what matters:
- Augmented thinking alone = advice you have to act on manually (a chatbot)
- Tools alone = automation without understanding (a script)
- Augmented thinking + tools = a system that can both reason about what to do and do it

The tool layer is not an afterthought. It's half the system. An agentic application designed without deep consideration of its tool capabilities is like a brain without hands.

## Human cognition as a design input

This is where agentic design diverges most sharply from classic software design.

When designing a CRUD form, you don't need to understand how humans sense danger or make subconscious judgments. You need to understand information architecture and input validation. The human's cognitive process is largely irrelevant — they read the label, fill the field, click submit.

When designing an agentic system — where the human and agent co-think and the agent can act through tools — human cognition becomes central to the design:

### When do humans trust a tool enough to let it act?

Humans use a tool when they feel it's safe. They act when they're sure, when nothing signals potential danger. This is deeply relevant to agentic design because the agent can DO things — browse the web, edit files, send messages, execute code.

Humans are remarkably good at sensing potential danger compared to machines. We run emotions and subconscious processes alongside our rational thinking — a slight feeling of "something's off" can stop us from clicking a button even when the logic says it's fine. This evolved for survival, and it fires in software interactions too.

**Design implication:** An agentic system that acts without giving the human's danger-sensing a chance to fire will either be distrusted (user disables it) or cause damage (user trusted too much too soon). The system needs to surface its intentions at the right moments — not every action (that's exhausting), but at the moments where the human's judgment adds real value.

### What do humans do better than agents?

Understanding where humans have evolutionary advantages (and disadvantages) compared to agents is essential for designing the boundary between them:

- **Humans are better at:** sensing that something feels wrong (even without clear evidence), understanding social and political context, making value judgments, feeling the weight of consequences, recognizing when a situation is unprecedented
- **Agents are better at:** holding large amounts of information simultaneously, not forgetting details, being thorough and systematic, working without fatigue, accessing and synthesizing broad knowledge quickly

**Design implication:** The best agentic applications will be designed around this boundary — letting the agent handle what it's better at, while creating natural moments for human judgment where humans excel. An engineer who understands this boundary deeply will design more useful agentic products than one who treats the agent as either "just a tool" or "a replacement human."

### The augmented thinking + tools combination amplifies this

When the agent only talks (augmented thinking without tools), the stakes of human judgment are lower — the worst case is bad advice that the human filters before acting.

When the agent also acts (augmented thinking with tools), the stakes rise. Now the human's danger-sensing, trust calibration, and judgment about when to intervene become critical safety mechanisms. The design must account for this:

- What does the agent do autonomously vs. what requires human approval?
- How does the system help the human build accurate trust calibration over time?
- How do you prevent both under-trust (agent is crippled by constant approval requests) and over-trust (human rubber-stamps everything)?

These are new design questions that didn't exist in classic software.

## What this means for the inventor

The BRD/PRD/SDD scaffold still applies. You still ask "who is this for, what does it do, how is it built." But the answers look different when the product is an agentic system:

- **BRD:** The problem space now includes "where does the human's thinking need augmentation" and "what actions should the system be able to take on behalf of the user" — not just "what task needs automation."
- **PRD:** User stories must describe iterative flows, not just input/output pairs. "As a user, I give a rough request and refine it in 2-3 steps" is a fundamentally different story than "As a user, I fill in a form and click submit."
- **SDD:** Architecture must account for the agent's reasoning layer AND its tool layer. The technology decisions include: what LLM, what tools does the agent have access to, what's the trust/approval model, how does the refinement loop work.

The SDLC skeleton holds. But the inventor building agentic products needs a new lens — one that puts human cognition and the augmented-thinking-plus-tools model at the center of design thinking.

## The app market transformation — agents eat the UI layer

Peter Steinberger (creator of OpenClaw) and his community are already seeing what happens when agents get tools:

**Apps stop being destinations and start being APIs.** A fitness coach agent that knows where you are can assume you're at Waffle House and help you make better food decisions. It can show UI exactly the way you like. Why do you need a separate fitness app? Why pay another subscription for something the agent can just do? Why do you need a sleep tracking app when the agent already knows where you are and what time it is?

**The agent replaces the UI, the service provides the data and actions.** Apps will become APIs — whether they want to or not — because agents can figure out how to use a phone directly. On Android, people already do this: the agent just clicks the "order Uber" button. On Apple it's trickier, but the direction is clear.

**This forces companies to rethink what they're selling:**
- Provide an API integration so agents can use your service easily and fast — or the agent will use your UI clumsily, or skip you entirely
- Data providers become more valuable (but could also be accessed via API)
- Hardware companies like Sonos have to ask: why do users need our app when the agent can talk to us directly?
- Companies that resist agent-friendliness lose. Example: Google has no CLI for its products — someone built GAWK as a workaround, but getting a Google API key is a jungle. Users will choose agent-friendly products over hostile ones.

**What this means for agentic design thinking:** The agent isn't just augmenting the user's thinking — it's augmenting their ability to act across services. The "tools" component isn't just about file systems and databases. It's about the agent having access to the entire ecosystem of services the user relies on. This makes the tool layer even more central to design: the value of an agentic product is directly proportional to what it can reach and do.

This is early. As Steinberger says: "We are just beginning to understand what this means."

## The craft shifts from programmer to builder

Steinberger articulates something that connects directly to the inventor thesis:

**Programming as a standalone activity is going away. Building products is not.** The world had a shortage of intelligence for a long time — that's why software developer salaries reached absurd levels. Tokenized intelligence (LLMs, agents) is closing that gap. The scarcity is shifting from "people who can write code" to "people who understand how to build things."

**The activity of programming changes, the role of programmer survives.** Steinberger describes still feeling like he's in the driver's seat, still feeling like he's writing the code — even when he doesn't type it. The new time that opens up goes into more details, more depth, better design. The level of expectations rises because the default output is now much easier to produce.

**Programmers are best equipped for the transition.** They already know how to think about systems, empathize with tools ("what do you need to do this task well?"), and feel the CLI. They speak the language of agents. At some point, working with agents will just be called "coding" again — the definition expands, not disappears.

**The mourning is real.** The deep flow state of finding beautiful solutions in code — that specific joy — is going away as a professional necessity. You can get a similar flow state from working with agents and thinking hard about problems. It's different. It's okay to mourn the old version. But the craft of building remains, and the builder who understands both the human problem and the technology landscape is more valuable than ever.

This reinforces the core thesis of this document and [1_TECHNOLOGY_GOD.md](1_TECHNOLOGY_GOD.md): the inventor's value is in seeing what to build and designing how it should work. Implementation skill doesn't disappear — it transforms from "writing code" to "directing the building process with judgment and taste."

## Open questions

These are things I don't yet know enough to answer:

- Are augmented thinking and tools the only two fundamental components, or are there others I haven't recognized?
- How do you measure whether an agentic product's trust calibration is right? What does "good" look like?
- How does the design change when the agent has access to high-stakes tools (sending money, publishing content, modifying infrastructure) vs. low-stakes tools (searching, summarizing, drafting)?
- What happens to this model as agents get more capable? Does the human's role shift, or does the boundary stay roughly the same?
- If apps become APIs, what does competition look like? Do agents pick the cheapest provider? The most capable? The one with the best data? Who controls that choice — the user, the agent, or the platform?

## Sources

- [Peter Steinberger: Why 80% Of Apps Will Disappear](https://www.youtube.com/watch?v=4uzGDAoNOZc)
- [NVIDIA GTC Keynote 2026](https://www.youtube.com/watch?v=jw_o0xr8MWU)
- [Lex Fridman Podcast: Peter Steinberger — OpenClaw](https://www.youtube.com/watch?v=YFjfBk8HI5o)
