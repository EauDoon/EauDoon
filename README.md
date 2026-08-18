# EauDoon

## AI systems builder from a business perspective

I turn operational problems into tested agent systems, decision tools, and reusable workflows.

This is my public build record: working artifacts, adversarial evaluations, documented failure cases, and explicit boundaries.

## Featured open-source project

### [Agent Action Stack](https://github.com/EauDoon/agent-action-stack)

One reference path across three libraries:

```text
Decide  →  Act              →  Prove
testbench  Consequence Rail    MandateBound
```

1. **Decide:** [Constitutional Agent Testbench](https://github.com/EauDoon/constitutional-agent-testbench) evaluates structured agent JSON against a declared policy.
2. **On pass → Act:** [Consequence Rail](https://github.com/EauDoon/consequence-rail) reserves recourse, executes, and settles or compensates.
3. **On dispute → Prove:** [MandateBound](https://github.com/EauDoon/mandatebound) runs evidence-readiness simulation for review.

```bash
npm run bootstrap
npm run demo          # decide → act (settled)
npm run demo:dispute  # decide → act → prove (compensated)
```

## Open-source projects

### Agent infrastructure

- [Constitutional Agent Testbench](https://github.com/EauDoon/constitutional-agent-testbench): Deterministic Python policy evaluation and PrecedenceTrace for structured agent responses.
- [Consequence Rail](https://github.com/EauDoon/consequence-rail): Recourse-gated execution, recovery preflight, and signed settlement receipts.
- [MandateBound](https://github.com/EauDoon/mandatebound): Evidence readiness and deterministic dispute replay for UCP/AP2 agentic commerce.
- [TraceCanary](https://github.com/EauDoon/tracecanary): Desktop GUI and CLI for detecting privacy regressions in OpenTelemetry GenAI exports with synthetic canaries.
- [Agent Team](https://github.com/EauDoon/agent-team-os): Bounded specialist-agent workflows with independent auditing.

### Decision methods

- [Corridor Lab](https://github.com/EauDoon/corridor-lab): Desktop GUI and CLI for comparing fictional cross-border payment routes across cost, speed, liquidity, and failure assumptions.
- [Unconventional Moves](https://github.com/EauDoon/unconventional-moves): Practical, non-obvious approaches with reversible 48-hour tests.
- [Partnership Breakpoint](https://github.com/EauDoon/partnership-breakpoint): Browser workbench for finding participant exit thresholds in shared commercial deals.
- [The Smallest Agreement](https://github.com/EauDoon/smallest-agreement): Local exhaustive search for the lowest-cost structured agreement that crosses a weighted approval threshold.
- [Weekend Gap](https://github.com/EauDoon/weekend-gap): AUD stablecoin weekend liquidity simulator with explicit operational bottlenecks, queues, and settlement timing.

### Experiments and examples

- [Common Cart](https://github.com/EauDoon/common-cart): Local-first pooled-purchase simulator that matches aggregate buyer constraints to synthetic merchant offers without exposing buyer records.
- [Hermes Parallel Follow-ups](https://github.com/EauDoon/hermes-parallel-followups): Drop-in patches and regression tests that preserve message boundaries and route independent follow-ups while Hermes is busy.
- [LLMs.txt Personal Site](https://github.com/EauDoon/llms-txt-personal-site): Forkable personal-site template with Markdown pages, `llms.txt`, JSON-LD, and a quality gate.

## How I build

**Business problem → specification → implementation → adversarial evaluation → acceptance**

## Authorship

I direct problem selection, product direction, requirements, business judgment, evaluation, rights review, and final acceptance for the projects published here.
