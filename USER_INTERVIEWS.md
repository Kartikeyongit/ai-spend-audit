# User Interviews

Three conversations with potential users of the AI Spend Audit tool. Conducted May 7-9, 2026.

---

## Interview 1: Raghav S., Assistant System Engineer, Early-stage (Seed)

**Date:** 2026-05-07
**Duration:** 14 minutes
**Channel:** X DM → moved to WhatsApp call

### Quotes

> "Bro honestly I don't even look at the Cursor bill anymore. It's just... it goes through the company card and I deal with it end of month. Last month I think it was like ₹40k? I didn't question it."

> "The thing is I'm the one who set up all these tools and now I feel stupid saying I don't know if we need all of them. Like I recommended Copilot AND Cursor to my co-founder. We have both. Two people. That's just embarrassing."

> "If something showed me I was wasting ₹15,000 a month I'd share that instantly. That's the kind of thing you screenshot and send to your investor update as a joke but also not a joke."

### Most Surprising Insight

I expected him to say he'd want the tool to help him choose *between* tools — like a comparison engine. But what actually bothered him wasn't the choice, it was the embarrassment of not knowing what he was already paying for. He said, almost as an aside, "I set all this up, so I'm not going to ask my co-founder to audit it — it'd look like I don't have it together." That social/ego dimension of AI spend didn't occur to me at all. The overspend is partly hidden because the person who'd fix it is also the person who caused it.

### What It Changed About My Design

Added a framing on the results page that's explicitly non-judgmental — something like "Most teams your size run 2–3 redundant tools" before showing the breakdown. Also made the shareable URL the primary CTA after results instead of the email gate, because Raghav's instinct was to share the screenshot, not save a PDF. The share-first flow fits that behavior better.

---

## Interview 2: Priya M., Engineering Manager, Series A (~60-person company)

**Date:** 2026-05-08
**Duration:** 17 minutes
**Channel:** LinkedIn message → Zoom call

### Quotes

> "We're on Claude Team and ChatGPT Team, both. And I genuinely could not tell you why. I think it was two different people who expensed them at two different times and then both got added to the budget line."

> "The problem isn't that I don't know there's redundancy. I *know*. I just don't have a clean number to put in the Slack message to my CFO. Like I need to say 'we're spending X on this and we could cut it to Y' and right now I can't do that in under an hour."

> "I'd use this. But I'd want to export it as something I can paste into a doc. Not email — I don't want another email. Just give me the text or a table I can copy."

### Most Surprising Insight

She already suspected the overspend — she didn't need the tool to discover it, she needed it to *quantify* it quickly enough to justify the conversation with her CFO. She said "I've been meaning to do this audit myself for three months" — and the blocker wasn't knowledge, it was that doing it manually felt like a 2-hour task she couldn't prioritize. That reframed the whole value prop for me. It's not insight generation, it's time savings for someone who already has a hunch.

Also, she pushed back on the email gate pretty firmly. "I don't want another newsletter. I get fifty cold emails a day already." That was direct and a little uncomfortable to hear mid-call.

### What It Changed About My Design

Two things. First, added a "Copy as table" button on the results page alongside the email capture — Priya's use case is real and she's not the only EM who wants to paste into a Notion doc or a Slack message. Second, rewrote the email gate copy to be explicit that it's a one-time audit report, not a mailing list. The word "newsletter" doesn't appear anywhere near the form now.

---

## Interview 3: Arjun T., Software Engineer, Pre-revenue side project

**Date:** 2026-05-09
**Duration:** 11 minutes
**Channel:** IndieHackers DM → voice note exchange (he preferred async)

### Quotes

> "I pay for Claude Pro and I use the free tier of ChatGPT. That's it. My total AI spend is like $20 a month. I know it's not a lot but I'm also not making any money yet so."

> "What I'd actually want to know is — at what point should I switch to API instead of the Pro subscription? Like when does the math flip? Nobody explains that clearly."

> "I sent your concept to two friends in a Telegram group and one of them said he'd use it for sure. The other one said 'I already know I'm overspending, I don't need an app to tell me that.' Which, fair."

### Most Surprising Insight

Arjun is at the low end of the spend spectrum — $20/month — and he knew it. I almost ended the call early thinking he wasn't the right user. But then he asked the API-vs-subscription question and I realized: that's a question the tool doesn't answer at all, and it's probably the most common question for solo devs ramping up. He's not the primary user today, but he's the primary user in 6 months once his side project takes off. And the tool has zero guidance for someone evaluating *when* to upgrade, only for people who are already overpaying.

His friend's comment — "I already know I'm overspending" — also stuck with me. Awareness isn't the gap. Action is.

### What It Changed About My Design

Added an API break-even calculator as a secondary feature on the results page for users who are on Pro/paid subscriptions: "Based on your usage pattern, switching to API direct would save you money if you send more than X messages/day." It's a rough estimate with a disclaimer, but it answers the question Arjun was actually asking. Also added a "You're spending well" results state that redirects low-spend users toward the API question rather than manufactured savings they don't have.

---

## Key Themes Across All Interviews

**1. Awareness isn't the gap — action is.** All three users already suspected some overspend. What they lacked was a quick, credible way to quantify it and justify the conversation (with a co-founder, CFO, or themselves).

**2. The emotional dimension matters.** Raghav's embarrassment, Priya's frustration with vendors, Arjun's anxiety about when to switch — these aren't purely financial decisions. The tool's tone needs to be non-judgmental, not "you're wasting money."

**3. Sharing comes before saving.** All three mentioned sending results to someone else — investor update, Slack to CFO, Telegram group. The shareable URL isn't a nice-to-have, it's the primary distribution channel.

**4. Email gates are a friction point for this audience.** Priya pushed back explicitly. The email capture needs to feel like a transaction (report in exchange for email) not a subscription trap.