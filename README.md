[![build](https://img.shields.io/github/actions/workflow/status/EauDoon/EauDoon/catalog.yml?branch=main)](https://github.com/EauDoon/EauDoon/actions)
[![license](https://img.shields.io/github/license/EauDoon/EauDoon)](https://github.com/EauDoon/EauDoon/blob/main/LICENSE)
[![last commit](https://img.shields.io/github/last-commit/EauDoon/EauDoon)](https://github.com/EauDoon/EauDoon)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img src="assets/banner-light.svg" alt="Daniel Oon. Decision infrastructure operator." width="100%">
</picture>

<p align="center">
  <a href="https://danieloon.ai">danieloon.ai</a> ·
  <a href="https://x.com/EauDoon">@EauDoon</a> ·
  <a href="https://www.linkedin.com/in/danieloon">LinkedIn</a>
</p>

I build software that makes agent actions and business decisions inspectable. My projects combine explicit rules, failure recovery, and reproducible evidence using Python, TypeScript, and JavaScript.

## Featured repos

| Repo | What it does |
| --- | --- |
| [decision-labs](https://github.com/EauDoon/decision-labs) | 4 offline browser workbenches for partnership, pooling, agreement, weekend liquidity. |
| [mandatebound](https://github.com/EauDoon/mandatebound) | deterministic evidence-pack builder and offline policy replay for UCP/AP2. |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | browser-only crypto research packet workbench with a frozen multi-agent team charter. |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) | portable reflection prompt and offline companion that prepares bounded packets for an LLM. |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | bounded remedy reservation, postcondition verification, and signed settlement receipts. |
| [operator-labs](https://github.com/EauDoon/operator-labs) | two offline Python tools for synthetic payment-route comparison and OTLP privacy regression. |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | deterministic policy-conformance and precedence-tracing harness, pip-installable. |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | AI-assistant-first personal-site template with llms.txt, JSON-LD, and a quality gate. |
| [connect.md](https://github.com/EauDoon/connect.md) | markdown-first professional network for people and agents, with FastAPI + Next.js surfaces. |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | installable skill that turns a broad request into bounded role assignments. |
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | thin orchestrator running Constitutional Agent Testbench + Consequence Rail + MandateBound. |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | installable skill that produces 5 to 7 mechanism-distinct practical approaches with 48-hour experiments. |
| [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) | Claude skill that runs a build/verify gauntlet loop with isolated verifiers. |

## Selected work

Start with **MandateBound**, an experimental evidence-review engine for agentic commerce. It replays a dispute from supplied evidence and returns unresolved when required evidence is missing, invalid, or conflicting.

| Project | Problem | What to inspect |
| --- | --- | --- |
| [MandateBound](https://github.com/EauDoon/mandatebound) | What can we establish when an agent-assisted purchase goes wrong? | [Worked evidence case](https://github.com/EauDoon/mandatebound/blob/main/docs/CASE_STUDY.md), deterministic replay, and tamper-rejection tests. |
| [Hermes Parallel Follow-ups](https://github.com/EauDoon/hermes-parallel-followups) | Separate messages sent to a busy agent can merge into one turn. | [Debugging case](https://github.com/EauDoon/hermes-parallel-followups/blob/main/docs/CASE_STUDY.md), bounded concurrency, cancellation tests, and reversible installers. Supports a documented source revision. |
| [Decision Labs](https://github.com/EauDoon/decision-labs) | A deal can look viable until a participant's costs or constraints change. | [Partnership case](https://github.com/EauDoon/decision-labs/blob/main/docs/CASE_STUDY.md) and four browser workbenches with explicit inputs and inspectable math. |

These cases use synthetic inputs and state what their checks establish. They do not claim customer adoption, production reliability, or demonstrated business impact.

## Decide, act, prove

[Agent Action Stack](https://github.com/EauDoon/agent-action-stack) is the runnable reference path connecting policy checks, action recovery, and dispute evidence. It combines [Constitutional Agent Testbench](https://github.com/EauDoon/constitutional-agent-testbench), [Consequence Rail](https://github.com/EauDoon/consequence-rail), and the evidence engine featured above.

## More projects

| Area | Project | What it provides |
| --- | --- | --- |
| Agent infrastructure | [Operator Labs](https://github.com/EauDoon/operator-labs) | Offline synthetic payment-route comparison and OTLP privacy-regression checks. |
| Agent infrastructure | [Agent Team](https://github.com/EauDoon/agent-team-os) | Bounded specialist workflows with checked plans, evidence handoffs, and audit records. |
| Decision methods | [Unconventional Moves](https://github.com/EauDoon/unconventional-moves) | Compare practical approaches and plan one bounded experiment, with a documented limited output evaluation. |
| Decision methods | [Crypto Research Desk](https://github.com/EauDoon/crypto-research-desk) | Research-only workflows and a browser workbench for evidence packets and independent risk review. |
| Developer tools | [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | A forkable static-site template with Markdown, llms.txt, JSON-LD, and consistency checks. |
| Browser tools | [connect.md](https://github.com/EauDoon/connect.md) | Local Markdown profile and resume drafting, preview, session recovery, and exports. Optional network services have separate deployment requirements. |

### Fork contribution

[Reflection Engine](https://github.com/EauDoon/reflection-engine), a fork of [Kevin Rose's original](https://github.com/kropdx/reflection-engine), adds a bounded prompt and offline source-preparation and review tools. The original prompt and attribution are preserved.

## How I build

I make assumptions and authority limits explicit, test failure paths alongside successful ones, and keep reproducible examples close to the code. A passing structural check is evidence about software behavior; decision quality still needs evaluation.

## Explore further

The [public project catalog](docs/CATALOG.md) compares tasks, runtimes, and documented data boundaries, including forks. It is a dated source snapshot, not a deployment or security certification.

For offline search with Node.js 22+, clone this repository and run `node cli.mjs search synthetic payment`. See the [discovery guide](docs/DISCOVERY.md), [saved-review workflows](docs/WORKFLOWS.md), and [machine-readable catalog](catalog.json). No package installation or account is required.

Machine-readable personal-site information is available at [llms.txt](https://danieloon.ai/llms.txt).
