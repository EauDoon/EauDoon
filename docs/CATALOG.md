<!--
  Generated catalog guide. Edits here are overwritten by `node scripts/render.mjs --write`.
  Encoding: UTF-8, LF, no BOM.
  Catalog waves recorded: 1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 15.
-->
# Public project catalog

Assessed 30-10-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security certification or verified deployment. Owned pins identify reviewed merged source; historical forks retain earlier assessments.

Each entry under [Limits and assessed instructions](#limits-and-assessed-instructions) states its own last audit date, which can be earlier than the catalog assessment.

Generated from [catalog.json](../catalog.json). For search, filters, comparison and task coverage, see the [discovery guide](DISCOVERY.md).

Runtime labels list supported workflows or prerequisites, not interchangeable runtimes. Read each assessed README for versions and setup.

## Data boundary labels

- `local-after-setup`: documented core workflow runs locally; obtaining dependencies may need a network. Local files can still be sensitive.
- `provider-dependent`: the selected assistant/model provider and enabled tools determine data handling.
- `configuration-dependent`: different workflows or optional integrations have different boundaries.
- `public-content`: the workflow reads or builds content intended for publication; publishing remains a separate action.

## Browse projects

### Owned projects

| Project | Purpose | Runtime | Data boundary |
| --- | --- | --- | --- |
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | Synthetic agent-action reference path with alternate case stores, saved-case verification and offline review exports\. | node, python, browser | local-after-setup |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Wire-format and tool pack for bounded multi-role work\. Ships the six-field role-brief schema, the connect specification, dependency-light validators, calibrated synthetic evaluation harness, and a deterministic package builder with SHA-256 verification\. | assistant, python | configuration-dependent |
| [blitz](https://github.com/EauDoon/blitz) | Minimum Viable Company kit with editable operating records, evidence gates, local cash forecasts and scoped handoffs\. | python, markdown, assistant | configuration-dependent |
| [connect\.md](https://github.com/EauDoon/connect.md) | Browser profile/resume Markdown builder with reviewed source replacements, recovery sessions, section excerpts and local review exports\. | browser, node | configuration-dependent |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | Recourse-gated synthetic execution with settlement and drill comparisons, verified review exports and recovery diagnostics\. | node | local-after-setup |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic policy evaluation with fixture assertions, corpus migration checks and portable replay bundles\. | python | local-after-setup |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | Browser workbench and five-specialist research kit for crypto forecast packets, fixed horizons and recorded independent review\. | browser, node, assistant | configuration-dependent |
| [decision-labs](https://github.com/EauDoon/decision-labs) | Four browser decision workbenches with bounded scenario analyses and replayable review packets\. | browser, node | local-after-setup |
| [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) | Patches for Hermes message boundaries and optional parallel follow-ups\. | python | configuration-dependent |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | Static personal-site template with draft-first writing, topic/date browsing and candidate-build review\. | python | public-content |
| [mandatebound](https://github.com/EauDoon/mandatebound) | Offline commerce evidence readiness, dispute replay, batch triage and read-only persisted-store audits\. | node | local-after-setup |
| [operator-labs](https://github.com/EauDoon/operator-labs) | Independent offline Python tools for synthetic payment routes and trace privacy checks\. | python | local-after-setup |
| [stable-desk](https://github.com/EauDoon/stable-desk) | Browser-local stablecoin research and source review with human-written decisions, recovery copies and explicit backup restoration\. | browser, node | configuration-dependent |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | Decision skill with offline experiment selection, checkpoint histories, bounded debriefs and reviewable handoff packets\. | assistant, python | configuration-dependent |

### Forks and upstream contributions

| Project | Purpose | Runtime | Data boundary |
| --- | --- | --- | --- |
| [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) (fork) | Claude skill that runs the gauntlet loop in two modes: reference mode drives a build to a shipped bar, verification mode seats isolated agents on load-bearing claims\. | assistant, node, python | provider-dependent |
| [hermes-agent](https://github.com/EauDoon/hermes-agent) (fork) | Fork of Nous Research Hermes Agent with terminal and gateway workflows\. | python, node | provider-dependent |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) (fork) | Fork of Kevin Rose's reflection prompt with offline source preparation, accepted-excerpt exports and stop-preserving experiment records\. | assistant, node | configuration-dependent |

## Start with a task

| Task | Projects |
| --- | --- |
| check-trace-privacy | [operator-labs](https://github.com/EauDoon/operator-labs) |
| compare-decisions | [decision-labs](https://github.com/EauDoon/decision-labs) |
| compare-payment-routes | [operator-labs](https://github.com/EauDoon/operator-labs) |
| compose-agent-actions | [agent-action-stack](https://github.com/EauDoon/agent-action-stack) |
| coordinate-agents | [agent-team-os](https://github.com/EauDoon/agent-team-os) |
| export-markdown | [connect\.md](https://github.com/EauDoon/connect.md) |
| forecast-cash | [blitz](https://github.com/EauDoon/blitz) |
| frame-offers | [blitz](https://github.com/EauDoon/blitz) |
| gate-actions | [consequence-rail](https://github.com/EauDoon/consequence-rail) |
| generate-experiments | [unconventional-moves](https://github.com/EauDoon/unconventional-moves) |
| manage-followups | [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) |
| match-reference-build | [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) |
| model-liquidity | [decision-labs](https://github.com/EauDoon/decision-labs) |
| publish-profile | [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) |
| record-decisions | [blitz](https://github.com/EauDoon/blitz) |
| reflect | [reflection-engine](https://github.com/EauDoon/reflection-engine) |
| replay-evidence | [agent-action-stack](https://github.com/EauDoon/agent-action-stack), [consequence-rail](https://github.com/EauDoon/consequence-rail), [mandatebound](https://github.com/EauDoon/mandatebound) |
| research-crypto | [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) |
| research-stablecoins | [stable-desk](https://github.com/EauDoon/stable-desk) |
| review-evidence | [agent-team-os](https://github.com/EauDoon/agent-team-os), [blitz](https://github.com/EauDoon/blitz), [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench), [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk), [mandatebound](https://github.com/EauDoon/mandatebound), [stable-desk](https://github.com/EauDoon/stable-desk) |
| run-agent | [hermes-agent](https://github.com/EauDoon/hermes-agent) |
| scope-exports | [blitz](https://github.com/EauDoon/blitz) |
| validate-policy | [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) |
| verify-claims | [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) |
| write-profile | [connect\.md](https://github.com/EauDoon/connect.md) |

## Limits and assessed instructions

### agent-action-stack

Experimental synthetic workflow; the response fixture gate is not signed authorization over the action proposal. Recorded handoffs do not prove source truth or legal effect.

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/efd3f08d3ca86f0fede8da383994804a48faaa1c/README.md) at efd3f08d3ca86f0fede8da383994804a48faaa1c. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md). Last audited 30-10-2026.

### agent-team-os

Wire-format and tool pack; does not assert a coordination protocol. Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the provider; native routing and paired model quality remain unverified.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/7f11e5437784f0e2dc0ded0d0b546c48d7841a4a/README.md) at 7f11e5437784f0e2dc0ded0d0b546c48d7841a4a. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md). Last audited 30-10-2026.

### blitz

Python 3.12+ helpers and editable records run locally; optional assistant workflows depend on the host, provider and tools. Skills need readable source or separate host installation; automatic routing is unverified. Calculations and synthetic examples do not establish demand, profitability or authority to spend, sign, contact anyone or deploy. Check the repository terms and individual component notices before use or redistribution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/blitz/blob/eb0fd45c48af0e9bb712011534eab6de9b8111f9/README.md) at eb0fd45c48af0e9bb712011534eab6de9b8111f9. [Current README](https://github.com/EauDoon/blitz/blob/main/README.md). Last audited 11-10-2026.

### connect.md

Guest drafts and checkpoints live in browser memory; downloaded recovery sessions and exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/2c036a3657bbc6de253ce9c0af5015afdc2c580b/README.md) at 2c036a3657bbc6de253ce9c0af5015afdc2c580b. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md). Last audited 30-10-2026.

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/59756ea0546cce8fc6e4fa056d9e9826f3a99ebd/README.md) at 59756ea0546cce8fc6e4fa056d9e9826f3a99ebd. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md). Last audited 30-10-2026.

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/bcf93986d5faddbf585dd71c07cce04e8d6b0653/README.md) at bcf93986d5faddbf585dd71c07cce04e8d6b0653. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md). Last audited 30-10-2026.

### crypto-research-desk

Research only; no trading authority. Structural checks do not authenticate sources, reviewer independence or delivery readiness.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/e49176e7785e32fff0e413af0603ac481836dfa3/README.md) at e49176e7785e32fff0e413af0603ac481836dfa3. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md). Last audited 30-10-2026.

### decision-labs

Declared-input models and unsigned review packets; no quotes, authenticated facts or execution authority. Exports can contain private inputs.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/fa4724ce5419eccd82d630aac8cefaa83990abe8/README.md) at fa4724ce5419eccd82d630aac8cefaa83990abe8. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md). Last audited 30-10-2026.

### gauntlet-verify

Needs an agent that can run isolated subagents, a browser or screenshot tool for a live reference, and web access; one full-formation round cost about 325k subagent tokens when measured. Enabling it alongside upstream gauntlet-loop can make both answer the same request. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/gauntlet-verify/blob/4c0f066e2018dc6bcc3761f069c361442bd84f66/README.md) at 4c0f066e2018dc6bcc3761f069c361442bd84f66. [Current README](https://github.com/EauDoon/gauntlet-verify/blob/main/README.md). Last audited 29-09-2026.

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md). Last audited 29-09-2026.

### hermes-parallel-followups

Supports one documented source snapshot; newer Hermes compatibility is not implied. Patching modifies selected local source files; cancellation deadlines require cooperative adapters.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/661ec8b26707930d09798417fc50ae087fdb1a84/README.md) at 661ec8b26707930d09798417fc50ae087fdb1a84. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md). Last audited 30-10-2026.

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/4de58b9730ee9655c4f900727bc68003843f6412/README.md) at 4de58b9730ee9655c4f900727bc68003843f6412. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md). Last audited 30-10-2026.

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/5216aaa1078fae89959b91e551b25f5134c11763/README.md) at 5216aaa1078fae89959b91e551b25f5134c11763. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md). Last audited 30-10-2026.

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/054f98a711c847652bf8e99aac63108a7756276e/README.md) at 054f98a711c847652bf8e99aac63108a7756276e. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md). Last audited 30-10-2026.

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/8aff243a77b4b9483928e0cbd5260659316aa715/README.md) at 8aff243a77b4b9483928e0cbd5260659316aa715. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md). Last audited 21-09-2026.

### stable-desk

Synthetic baseline and manual research; no trading or outreach. Exports can contain research notes, and browser storage is not a backup. Hosted source identity is unverified. All rights reserved: the source is public for reading only and no reuse permission is granted.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/stable-desk/blob/132c5bac76845bd60f9442c9b6806fc878f63a99/README.md) at 132c5bac76845bd60f9442c9b6806fc878f63a99. [Current README](https://github.com/EauDoon/stable-desk/blob/main/README.md). Last audited 30-10-2026.

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. Native routing and paired model quality remain unverified. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/3f09cb407d0332b63450308bdccef8bfe9c9e1d4/README.md) at 3f09cb407d0332b63450308bdccef8bfe9c9e1d4. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md). Last audited 30-10-2026.
