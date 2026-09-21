# Public project catalog

Assessed 21-09-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security audit or verified deployment. Pins identify reviewed source snapshots, including earlier entries; they do not guarantee current main.

Generated from [catalog.json](../catalog.json). For search, filters, comparison and task coverage, see the [discovery guide](DISCOVERY.md).

Runtime labels list supported workflows or prerequisites, not interchangeable runtimes. Read each assessed README for versions and setup.

## Data boundary labels

- `local-after-setup`: documented core workflow runs locally; obtaining dependencies may need a network. Local files can still be sensitive.
- `provider-dependent`: the selected assistant/model provider and enabled tools determine data handling.
- `configuration-dependent`: different workflows or optional integrations have different boundaries.
- `public-content`: the workflow reads or builds content intended for publication; publishing remains a separate action.

## Browse projects

| Project | Purpose | Runtime | Data boundary |
| --- | --- | --- | --- |
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | Synthetic agent-action reference path with alternate case stores, saved-case verification and offline review exports\. | node, python, browser | local-after-setup |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Installable specialist-workflow skill with brief authoring, readiness inspection, evidence-impact review and checked handoffs\. | assistant, python | configuration-dependent |
| [connect\.md](https://github.com/EauDoon/connect.md) | Browser profile/resume Markdown builder with reviewed source replacements, recovery sessions, section excerpts and local review exports\. | browser, node | configuration-dependent |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | Recourse-gated synthetic execution with settlement and drill comparisons, verified review exports and recovery diagnostics\. | node | local-after-setup |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic policy evaluation with fixture assertions, corpus migration checks and portable replay bundles\. | python | local-after-setup |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | Research-only crypto team kit with five specialist lanes, fixed forecast horizons and independent risk review\. | browser, node, assistant | configuration-dependent |
| [decision-labs](https://github.com/EauDoon/decision-labs) | Four browser decision workbenches with bounded scenario analyses and replayable review packets\. | browser, node | local-after-setup |
| [EauDoon](https://github.com/EauDoon/EauDoon) | Offline public project catalog with reproducible saved briefs, task coverage matrices and review exports\. | markdown, node | public-content |
| [hermes-agent](https://github.com/EauDoon/hermes-agent) (fork) | Fork of Nous Research Hermes Agent with terminal and gateway workflows\. | python, node | provider-dependent |
| [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) | Patches for Hermes message boundaries and optional parallel follow-ups\. | python | configuration-dependent |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | Static personal-site template with draft-first writing, topic/date browsing and candidate-build review\. | python | public-content |
| [mandatebound](https://github.com/EauDoon/mandatebound) | Offline commerce evidence readiness, dispute replay, batch triage and read-only persisted-store audits\. | node | local-after-setup |
| [operator-labs](https://github.com/EauDoon/operator-labs) | Independent offline Python tools for synthetic payment routes and trace privacy checks\. | python | local-after-setup |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) (fork) | Fork of Kevin Rose's reflection prompt with offline source preparation, accepted-excerpt exports and stop-preserving experiment records\. | assistant, node | configuration-dependent |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | Decision skill with offline experiment selection, checkpoint histories, bounded debriefs and reviewable handoff packets\. | assistant, python | configuration-dependent |

## Start with a task

| Task | Projects |
| --- | --- |
| check-trace-privacy | [operator-labs](https://github.com/EauDoon/operator-labs) |
| compare-decisions | [decision-labs](https://github.com/EauDoon/decision-labs) |
| compare-payment-routes | [operator-labs](https://github.com/EauDoon/operator-labs) |
| compose-agent-actions | [agent-action-stack](https://github.com/EauDoon/agent-action-stack) |
| coordinate-agents | [agent-team-os](https://github.com/EauDoon/agent-team-os) |
| export-markdown | [connect\.md](https://github.com/EauDoon/connect.md) |
| find-projects | [EauDoon](https://github.com/EauDoon/EauDoon) |
| gate-actions | [consequence-rail](https://github.com/EauDoon/consequence-rail) |
| generate-experiments | [unconventional-moves](https://github.com/EauDoon/unconventional-moves) |
| manage-followups | [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) |
| model-liquidity | [decision-labs](https://github.com/EauDoon/decision-labs) |
| publish-profile | [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) |
| reflect | [reflection-engine](https://github.com/EauDoon/reflection-engine) |
| replay-evidence | [agent-action-stack](https://github.com/EauDoon/agent-action-stack), [consequence-rail](https://github.com/EauDoon/consequence-rail), [mandatebound](https://github.com/EauDoon/mandatebound) |
| research-crypto | [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) |
| review-evidence | [agent-team-os](https://github.com/EauDoon/agent-team-os), [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench), [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk), [mandatebound](https://github.com/EauDoon/mandatebound) |
| run-agent | [hermes-agent](https://github.com/EauDoon/hermes-agent) |
| validate-policy | [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) |
| write-profile | [connect\.md](https://github.com/EauDoon/connect.md) |

## Limits and assessed instructions

### agent-action-stack

Experimental synthetic workflow; does not prove legal effect or evidence truth.

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/491eede8a88e9ba70a37298f0620a92a3201585a/README.md) at 491eede8a88e9ba70a37298f0620a92a3201585a. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the chosen provider.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/1593cb1f90f9f98b2f208d1a6adfa57eabc7bffe/README.md) at 1593cb1f90f9f98b2f208d1a6adfa57eabc7bffe. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts and checkpoints live in browser memory; downloaded recovery sessions and exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/1fabde9155f93266b0a78d6f6b33d495601ea6a7/README.md) at 1fabde9155f93266b0a78d6f6b33d495601ea6a7. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/4c3afdbfc5e0a638755313829f08b44fa2a6a12e/README.md) at 4c3afdbfc5e0a638755313829f08b44fa2a6a12e. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/a9123af65f64cba74e5dfbc08f28f23ae4df9bbb/README.md) at a9123af65f64cba74e5dfbc08f28f23ae4df9bbb. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Browser validation does not authenticate sources or independent review.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/4968d3f8807d0026e9cef7ad5d77d3bb66ec1a54/README.md) at 4968d3f8807d0026e9cef7ad5d77d3bb66ec1a54. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Declared-input models and unsigned review packets; no quotes, authenticated facts or execution authority. Exports can contain private inputs.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/77d9aee1764c9a1b02349153610d756aef0d3318/README.md) at 77d9aee1764c9a1b02349153610d756aef0d3318. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

### EauDoon

A curated public snapshot, not certification or a live inventory service.

Category: discovery. [Assessed README](https://github.com/EauDoon/EauDoon/blob/89183a9af48ac26104b57dd9834cf5528fc073d8/README.md) at 89183a9af48ac26104b57dd9834cf5528fc073d8. [Current README](https://github.com/EauDoon/EauDoon/blob/main/README.md).

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md).

### hermes-parallel-followups

Supports one documented source snapshot; newer Hermes compatibility is not implied. Patching modifies selected local source files.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/cd9ff035566a872caac394b35751ad730c9abf06/README.md) at cd9ff035566a872caac394b35751ad730c9abf06. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md).

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/a5349349b3e26b59affdadd5dcfec538afdbd195/README.md) at a5349349b3e26b59affdadd5dcfec538afdbd195. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/e2a807d7cba912073cfb613ce425ea92cdbabec1/README.md) at e2a807d7cba912073cfb613ce425ea92cdbabec1. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/ceb2ecb119c0f873deafb8647c4558f8434ad149/README.md) at ceb2ecb119c0f873deafb8647c4558f8434ad149. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/8aff243a77b4b9483928e0cbd5260659316aa715/README.md) at 8aff243a77b4b9483928e0cbd5260659316aa715. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/ca30eb36bc6716611e244f73f4c71b2b0ea1e190/README.md) at ca30eb36bc6716611e244f73f4c71b2b0ea1e190. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
