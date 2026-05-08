# LLM Prompts

## AI Summary Generation

**Model:** Claude 3.5 Haiku (fast, cheap, good enough for ~100 word summaries)
**Temperature:** 0.7 (slightly creative for natural tone, but grounded in data)
**Max tokens:** 300 (summary is ~100 words, 300 tokens gives headroom)

### System Prompt

```text
You are a helpful AI spending analyst. Write concise, specific, and actionable summaries. Never hallucinate prices or make up data. Only reference information provided in the audit.
```

### User Prompt

```text
Write a ~100 word personalized summary of this AI spending audit. Be specific, use actual numbers, and sound like a friendly analyst, not a robot.
Team: [teamSize] people Primary use case: [primaryUseCase] Tools analyzed: [toolSummary]
Total potential savings: [totalMonthlySavings]/month ([totalAnnualSavings]/year)
Savings opportunities: [savingsSummary or "None — all tools are on optimal plans"]
[if noSavingsTools] Already optimized: [noSavingsTools]
Guidelines:

* Start with their specific situation (team size, use case, tools)
* Mention the biggest savings opportunity and the total
* If savings > $500/month, emphasize this is significant
* If savings < $100/month, be encouraging but honest
* Never mention "Credex" — this is an objective audit
* Keep it to roughly 100 words
```

### Why I Wrote It This Way

1. **Structured data input, not free text** — The prompt is built programmatically from audit results. This prevents hallucination by constraining the LLM to only reference provided numbers.

2. **Explicit formatting constraints** — "Roughly 100 words" prevents rambling. The report page has limited space for this summary.

3. **Tone guidance** — "Friendly analyst, not a robot" produces warmer, more shareable summaries than "professional business consultant."

4. **No mention of Credex** — The summary is part of the objective audit. The Credex pitch lives separately in the CTA card. Mixing them would erode trust.

5. **Temperature 0.7, not 0** — Zero temperature produces repetitive, robotic summaries across different audits. 0.7 gives variety while staying factual because the prompt constrains heavily.

### What I Tried That Didn't Work

1. **GPT-4o instead of Claude** — Generated slightly longer summaries (150–180 words) even with explicit word limits. Claude followed constraints more precisely.

2. **No system prompt** — Without system prompt, the model occasionally invented "industry average" benchmarks that weren't in the data. The system prompt's "only reference information provided" fixed this.

3. **Temperature 0** — Summaries were grammatically correct but identical in structure across different audits. Users would notice the pattern and trust the tool less.

4. **Streaming** — Added unnecessary complexity for a 100-word summary. The response is fast enough without streaming (< 1 second for Haiku).

### Fallback Strategy

If the Anthropic API is unavailable (no API key, rate limited, network error), the tool uses a templated summary with the same structure. The template is in `src/lib/ai-summary.ts` (`generateTemplateSummary`). It covers all three cases: high savings, moderate savings, and optimized.