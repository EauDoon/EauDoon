# EauDoon

[Website](https://danieloon.ai) · [@EauDoon](https://x.com/EauDoon) · [LinkedIn](https://www.linkedin.com/in/danieloon)

I build software that makes agent actions and business decisions inspectable, using explicit rules, failure recovery, and reproducible evidence.

These repositories are a public build record. Worked cases use synthetic inputs and state what their checks establish; they do not claim customer adoption, production reliability, or demonstrated business impact.

## Featured open-source project

**[MandateBound](https://github.com/EauDoon/mandatebound)** is an experimental evidence-review engine for agentic commerce. It replays a dispute from supplied evidence and returns unresolved when required evidence is missing, invalid, or conflicting. Start with the [worked evidence case](https://github.com/EauDoon/mandatebound/blob/main/docs/CASE_STUDY.md), then inspect deterministic replay and tamper-rejection tests.

## Public projects

| Area | Project | What to inspect |
| --- | --- | --- |
| Flagship systems | [Decision Labs](https://github.com/EauDoon/decision-labs) | Four local browser workbenches for business decisions, with explicit inputs and a [partnership case](https://github.com/EauDoon/decision-labs/blob/main/docs/CASE_STUDY.md). |
| Agent infrastructure | [Agent Action Stack](https://github.com/EauDoon/agent-action-stack) | A runnable synthetic reference path connecting policy checks, action recovery, and dispute evidence. |
| Agent infrastructure | [Consequence Rail](https://github.com/EauDoon/consequence-rail) | Recourse-gated execution, recovery preflight, and signed settlement receipts for autonomous actions. |
| Agent infrastructure | [Constitutional Agent Testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic policy-conformance checks and precedence traces for structured agent responses. |
| Agent infrastructure | [Hermes Parallel Follow-ups](https://github.com/EauDoon/hermes-parallel-followups) | A [debugging case](https://github.com/EauDoon/hermes-parallel-followups/blob/main/docs/CASE_STUDY.md), bounded concurrency, cancellation tests, and reversible patches for a documented source revision. |
| Agent infrastructure | [Agent Team](https://github.com/EauDoon/agent-team-os) | A reusable skill for bounded specialist workflows, evidence handoffs, and independent review. |
| Decision methods | [Unconventional Moves](https://github.com/EauDoon/unconventional-moves) | A decision skill for comparing practical approaches and planning reversible experiments. |
| Decision methods | [Crypto Research Desk](https://github.com/EauDoon/crypto-research-desk) | Research-only workflows and a browser workbench for evidence packets and independent risk review. |
| Experiments and examples | [Operator Labs](https://github.com/EauDoon/operator-labs) | Two offline Python tools for synthetic payment-route comparison and OTLP privacy-regression checks. |
| Experiments and examples | [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | A static-site template with Markdown, llms.txt, JSON-LD, and reproducible build checks. |
| Experiments and examples | [connect.md](https://github.com/EauDoon/connect.md) | Local Markdown profile and resume drafting, preview, session recovery, and exports. Optional network services have separate deployment requirements. |

### Public experiment

[Stable Desk](https://github.com/EauDoon/stable-desk) is a browser-local stablecoin research and source-review workbench with a synthetic baseline, human-reviewed decisions, and explicit backup restoration. Exported files are the backups; hosted source identity remains unverified. No license has been selected, so public visibility does not grant reuse permission.

### Fork contribution

[Reflection Engine](https://github.com/EauDoon/reflection-engine), a fork of [Kevin Rose's original](https://github.com/kropdx/reflection-engine), adds a bounded prompt and offline source-preparation and review tools. The original prompt and attribution are preserved. Other previously assessed forks remain separately labeled in the catalog.

## How I build

I make assumptions and authority limits explicit, test failure paths alongside successful ones, and keep reproducible examples close to the code. A passing structural check is evidence about software behavior; decision quality still needs evaluation. Repository licenses and upstream attribution define the reuse and authorship boundaries.

## Explore the catalog

The [public project catalog](docs/CATALOG.md) compares tasks, runtimes, and documented data boundaries. It is a dated source snapshot, not a deployment or security certification. The [public inventory check](docs/DISCOVERY.md#check-public-inventory-coverage) accounts for assessed projects and explicit exclusions.

For offline search with Node.js 22+, run `node cli.mjs search synthetic payment` from a clone. No package installation or account is required. See [setup and checks](docs/DISCOVERY.md), [saved-review workflows](docs/WORKFLOWS.md), and the [machine-readable catalog](catalog.json).
