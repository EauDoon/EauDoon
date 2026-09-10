# Public project catalog

Assessed 10-09-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security audit or verified deployment. Pins identify reviewed source snapshots, including earlier entries; they do not guarantee current main.

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
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | Synthetic agent-action reference path with saved-case inspection, metadata comparisons and offline review exports\. | node, python, browser | local-after-setup |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Installable specialist-workflow skill with brief authoring, evidence-impact inspection and checked handoffs\. | assistant, python | configuration-dependent |
| [connect\.md](https://github.com/EauDoon/connect.md) | Browser profile/resume Markdown builder with recovery sessions, revision checkpoints and review exports; optional network source\. | browser, node | configuration-dependent |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | Recourse-gated synthetic execution with pinned settlement review, recovery diagnostics and bounded fault exercises\. | node | local-after-setup |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic policy evaluation, regression triage, corpus checks and digest-bound suite receipts\. | python | local-after-setup |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | Research workflow and browser forecast workbench with baseline review, source audits and manual monitoring worksheets\. | browser, node, assistant | configuration-dependent |
| [decision-labs](https://github.com/EauDoon/decision-labs) | Four browser decision workbenches with bounded scenario analyses and replayable review packets\. | browser, node | local-after-setup |
| [EauDoon](https://github.com/EauDoon/EauDoon) | Public profile with an offline searchable project catalog, comparisons and task shortlists\. | markdown, node | public-content |
| [hermes-agent](https://github.com/EauDoon/hermes-agent) (fork) | Fork of Nous Research Hermes Agent with terminal and gateway workflows\. | python, node | provider-dependent |
| [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) | Patches for Hermes message boundaries and optional parallel follow-ups\. | python | configuration-dependent |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | Static personal-site template with draft-first writing, topic/date browsing and candidate-build review\. | python | public-content |
| [mandatebound](https://github.com/EauDoon/mandatebound) | Offline commerce evidence readiness, dispute replay, anchor-context comparisons and assessment receipts\. | node | local-after-setup |
| [operator-labs](https://github.com/EauDoon/operator-labs) | Independent offline Python tools for synthetic payment routes and trace privacy checks\. | python | local-after-setup |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) (fork) | Fork of Kevin Rose's reflection prompt with offline source selection, run-bound human reviews and optional experiment records\. | assistant, node | configuration-dependent |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | Decision skill with offline experiment selection, cumulative checkpoints and reviewable handoff packets\. | assistant, python | configuration-dependent |

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

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/01ff9f7d46b3516d6be5613d06d724d4874eb62f/README.md) at 01ff9f7d46b3516d6be5613d06d724d4874eb62f. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the chosen provider.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/c58000a2657a99748eb96ada573ae394628712b2/README.md) at c58000a2657a99748eb96ada573ae394628712b2. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts and checkpoints live in browser memory; downloaded recovery sessions and exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/05286d2ba0b9c7721a1a44cb32b9e87a8e7326a3/README.md) at 05286d2ba0b9c7721a1a44cb32b9e87a8e7326a3. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/51f578d4a78b84c65503da70785d9905e6fc5968/README.md) at 51f578d4a78b84c65503da70785d9905e6fc5968. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/1f13a647dd71eb7c56d45b4cfe93a7d63855b5ad/README.md) at 1f13a647dd71eb7c56d45b4cfe93a7d63855b5ad. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Browser validation does not authenticate sources or independent review.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/37cc9ca0b26f6f1f77ae558f78313269b7abbf89/README.md) at 37cc9ca0b26f6f1f77ae558f78313269b7abbf89. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Declared-input models and unsigned review packets; no quotes, authenticated facts or execution authority. Exports can contain private inputs.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/8b7ab291a7f5319f384b3e392e13b02e752b04bb/README.md) at 8b7ab291a7f5319f384b3e392e13b02e752b04bb. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

### EauDoon

A curated public snapshot, not certification or a live inventory service.

Category: discovery. [Assessed README](https://github.com/EauDoon/EauDoon/blob/6460b8e4e0b4d0db767324db7aea5a21773324c7/README.md) at 6460b8e4e0b4d0db767324db7aea5a21773324c7. [Current README](https://github.com/EauDoon/EauDoon/blob/main/README.md).

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md).

### hermes-parallel-followups

Supports one documented source snapshot; newer Hermes compatibility is not implied. Patching modifies selected local source files.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/cd9ff035566a872caac394b35751ad730c9abf06/README.md) at cd9ff035566a872caac394b35751ad730c9abf06. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md).

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/a4bac9f923bd14a6500413062501046813c87ae9/README.md) at a4bac9f923bd14a6500413062501046813c87ae9. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/c0f50c6ed887f51c1fb7e8d58ef31048381f2952/README.md) at c0f50c6ed887f51c1fb7e8d58ef31048381f2952. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/2837b4c9da5b241f838c3ae979a9b8d9f182a7d1/README.md) at 2837b4c9da5b241f838c3ae979a9b8d9f182a7d1. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/79884078c7b8270838eb909224bd50bd45aa6775/README.md) at 79884078c7b8270838eb909224bd50bd45aa6775. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/5028a6deb92c6cb0a8fe147c4af4f7c1e04494e0/README.md) at 5028a6deb92c6cb0a8fe147c4af4f7c1e04494e0. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
