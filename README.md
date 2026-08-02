# Oonyl

## AI systems builder from the business side

I turn operational problems into tested agent systems, decision tools, and reusable workflows.

This is my public build record: working artifacts, adversarial evaluations, documented failure cases, and explicit boundaries.

## Featured open-source project

### [Agent Action Stack](https://github.com/oonyl/agent-action-stack)

One reference path across three libraries:

```text
Decide  →  Act              →  Prove
testbench  Consequence Rail    MandateBound
```

1. **Decide:** [Constitutional Agent Testbench](https://github.com/oonyl/constitutional-agent-testbench) evaluates structured agent JSON against a declared policy.
2. **On pass → Act:** [Consequence Rail](https://github.com/oonyl/consequence-rail) reserves recourse, executes, and settles or compensates.
3. **On dispute → Prove:** [MandateBound](https://github.com/oonyl/mandatebound) runs evidence-readiness simulation for review.

```bash
npm run bootstrap
npm run demo          # decide → act (settled)
npm run demo:dispute  # decide → act → prove (compensated)
```

## Open-source projects

### Agent infrastructure

- [Constitutional Agent Testbench](https://github.com/oonyl/constitutional-agent-testbench): Deterministic Python policy evaluation and PrecedenceTrace for structured agent responses.
- [Consequence Rail](https://github.com/oonyl/consequence-rail): Recourse-gated execution, recovery preflight, and signed settlement receipts.
- [MandateBound](https://github.com/oonyl/mandatebound): Evidence readiness and deterministic dispute replay for UCP/AP2 agentic commerce.

- [TraceCanary](https://github.com/oonyl/tracecanary): Desktop GUI and CLI for detecting privacy regressions in OpenTelemetry GenAI exports with synthetic canaries.
- [Agent Team](https://github.com/oonyl/agent-team-os): Bounded specialist-agent workflows with independent auditing.

### Decision methods

- [Corridor Lab](https://github.com/oonyl/corridor-lab): Desktop GUI and CLI for comparing fictional cross-border payment routes across cost, speed, liquidity, and failure assumptions.
- [Unconventional Moves](https://github.com/oonyl/unconventional-moves): Practical, non-obvious approaches with reversible 48-hour tests.

## How I build

**Business problem → specification → implementation → adversarial evaluation → acceptance**

## Authorship

I direct problem selection, product direction, requirements, business judgment, evaluation, rights review, and final acceptance for the projects published here.
