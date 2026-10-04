<!--
  Generated catalog guide. Edits here are overwritten by `node scripts/render.mjs --write`.
  Encoding: UTF-8, LF, no BOM.
  Catalog waves recorded: 1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 15.
-->
# Public project catalog

Assessed 04-10-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security certification or verified deployment. Owned pins identify reviewed merged source; historical forks retain earlier assessments.

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
| gate-actions | [consequence-rail](https://github.com/EauDoon/consequence-rail) |
| generate-experiments | [unconventional-moves](https://github.com/EauDoon/unconventional-moves) |
| manage-followups | [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) |
| match-reference-build | [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) |
| model-liquidity | [decision-labs](https://github.com/EauDoon/decision-labs) |
| publish-profile | [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) |
| reflect | [reflection-engine](https://github.com/EauDoon/reflection-engine) |
| replay-evidence | [agent-action-stack](https://github.com/EauDoon/agent-action-stack), [consequence-rail](https://github.com/EauDoon/consequence-rail), [mandatebound](https://github.com/EauDoon/mandatebound) |
| research-crypto | [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) |
| research-stablecoins | [stable-desk](https://github.com/EauDoon/stable-desk) |
| review-evidence | [agent-team-os](https://github.com/EauDoon/agent-team-os), [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench), [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk), [mandatebound](https://github.com/EauDoon/mandatebound), [stable-desk](https://github.com/EauDoon/stable-desk) |
| run-agent | [hermes-agent](https://github.com/EauDoon/hermes-agent) |
| validate-policy | [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) |
| verify-claims | [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) |
| write-profile | [connect\.md](https://github.com/EauDoon/connect.md) |

## Limits and assessed instructions

### agent-action-stack

Experimental synthetic workflow; the response fixture gate is not signed authorization over the action proposal. Recorded handoffs do not prove source truth or legal effect.

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/8179e59354355678f8b749f4faa178aa8ed0c39d/README.md) at 8179e59354355678f8b749f4faa178aa8ed0c39d. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Wire-format and tool pack; does not assert a coordination protocol. Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the provider; native routing and paired model quality remain unverified.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/39c45d21b00ff5a9f987de8e79232cad77d14e12/README.md) at 39c45d21b00ff5a9f987de8e79232cad77d14e12. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts and checkpoints live in browser memory; downloaded recovery sessions and exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/1c030b60d2496b755e506e7b3ae7d56facc4eda5/README.md) at 1c030b60d2496b755e506e7b3ae7d56facc4eda5. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/c430383c0a0931f0dcf17845d6f0e8ccf328615a/README.md) at c430383c0a0931f0dcf17845d6f0e8ccf328615a. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/826008c0d615414330c376ed413fff3620686c80/README.md) at 826008c0d615414330c376ed413fff3620686c80. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Structural checks do not authenticate sources, reviewer independence or delivery readiness.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/5f69af383efe7b84b0d945873272522502e483b6/README.md) at 5f69af383efe7b84b0d945873272522502e483b6. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Declared-input models and unsigned review packets; no quotes, authenticated facts or execution authority. Exports can contain private inputs.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/d7003994fc439fa63eedd5aa13fc913539d09de0/README.md) at d7003994fc439fa63eedd5aa13fc913539d09de0. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

### gauntlet-verify

Needs an agent that can run isolated subagents, a browser or screenshot tool for a live reference, and web access; one full-formation round cost about 325k subagent tokens when measured. Enabling it alongside upstream gauntlet-loop can make both answer the same request. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/gauntlet-verify/blob/4c0f066e2018dc6bcc3761f069c361442bd84f66/README.md) at 4c0f066e2018dc6bcc3761f069c361442bd84f66. [Current README](https://github.com/EauDoon/gauntlet-verify/blob/main/README.md).

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md).

### hermes-parallel-followups

Supports one documented source snapshot; newer Hermes compatibility is not implied. Patching modifies selected local source files; cancellation deadlines require cooperative adapters.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/908a77ff6b58ef1932f3abaa49cef64fa09ad3e1/README.md) at 908a77ff6b58ef1932f3abaa49cef64fa09ad3e1. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md).

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/9e3642b9e691609bff0a58e9ed90ba4d87676003/README.md) at 9e3642b9e691609bff0a58e9ed90ba4d87676003. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/708256d4e48babeb13079fac7589d172920a5c95/README.md) at 708256d4e48babeb13079fac7589d172920a5c95. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/5531da84d08df67b6b3de804a5b63b28b0df134e/README.md) at 5531da84d08df67b6b3de804a5b63b28b0df134e. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/8aff243a77b4b9483928e0cbd5260659316aa715/README.md) at 8aff243a77b4b9483928e0cbd5260659316aa715. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### stable-desk

Synthetic baseline and manual research; no trading or outreach. Exports can contain research notes, and browser storage is not a backup. Hosted source identity is unverified. No license selected.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/stable-desk/blob/226cf10be05ca8b36aeba6bbc0d24a99c77d8bd7/README.md) at 226cf10be05ca8b36aeba6bbc0d24a99c77d8bd7. [Current README](https://github.com/EauDoon/stable-desk/blob/main/README.md).

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. Native routing and paired model quality remain unverified. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/d187cb3d827695919a18fb773899ddec1b2d6e68/README.md) at d187cb3d827695919a18fb773899ddec1b2d6e68. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
