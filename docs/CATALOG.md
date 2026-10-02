<!--
  Generated catalog guide. Edits here are overwritten by `node scripts/render.mjs --write`.
  Encoding: UTF-8, LF, no BOM.
  Catalog waves recorded: 1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 15.
-->
# Public project catalog

Assessed 02-10-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security certification or verified deployment. Owned pins identify reviewed merged source; historical forks retain earlier assessments.

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
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Installable specialist-workflow skill with brief authoring, readiness inspection, evidence-impact review and checked handoffs\. | assistant, python | configuration-dependent |
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

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/9449bd3a8cc3f06fff985db008e27225ffc69ecc/README.md) at 9449bd3a8cc3f06fff985db008e27225ffc69ecc. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the provider; native routing and paired model quality remain unverified.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/36e9a94088273cd1dc4846e18a2ae0b355289c51/README.md) at 36e9a94088273cd1dc4846e18a2ae0b355289c51. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts and checkpoints live in browser memory; downloaded recovery sessions and exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/1247953f91947e32222ba5b3f578003e55be9430/README.md) at 1247953f91947e32222ba5b3f578003e55be9430. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/9f60ab3223970c22371c20d3584e8330674d997c/README.md) at 9f60ab3223970c22371c20d3584e8330674d997c. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/fda346679658a19e32f13ce289e3d770695895ea/README.md) at fda346679658a19e32f13ce289e3d770695895ea. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Structural checks do not authenticate sources, reviewer independence or delivery readiness.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/5f69af383efe7b84b0d945873272522502e483b6/README.md) at 5f69af383efe7b84b0d945873272522502e483b6. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Declared-input models and unsigned review packets; no quotes, authenticated facts or execution authority. Exports can contain private inputs.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/c2c56c50121fc1cf61d24357a793e26de8b8389b/README.md) at c2c56c50121fc1cf61d24357a793e26de8b8389b. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

### gauntlet-verify

Needs an agent that can run isolated subagents, a browser or screenshot tool for a live reference, and web access; one full-formation round cost about 325k subagent tokens when measured. Enabling it alongside upstream gauntlet-loop can make both answer the same request. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/gauntlet-verify/blob/4c0f066e2018dc6bcc3761f069c361442bd84f66/README.md) at 4c0f066e2018dc6bcc3761f069c361442bd84f66. [Current README](https://github.com/EauDoon/gauntlet-verify/blob/main/README.md).

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md).

### hermes-parallel-followups

Supports one documented source snapshot; newer Hermes compatibility is not implied. Patching modifies selected local source files; cancellation deadlines require cooperative adapters.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/008290477ecdc9e23db8faf7d49e16f991b3b329/README.md) at 008290477ecdc9e23db8faf7d49e16f991b3b329. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md).

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/ac7114387fdd0cbfabc22174e35ead15b9a632ae/README.md) at ac7114387fdd0cbfabc22174e35ead15b9a632ae. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/b51fe137958afe26eee052c5a129e5481ccae560/README.md) at b51fe137958afe26eee052c5a129e5481ccae560. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/fd068ca59c53758650c98241d26db6efb445cf93/README.md) at fd068ca59c53758650c98241d26db6efb445cf93. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/8aff243a77b4b9483928e0cbd5260659316aa715/README.md) at 8aff243a77b4b9483928e0cbd5260659316aa715. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### stable-desk

Synthetic baseline and manual research; no trading or outreach. Exports can contain research notes, and browser storage is not a backup. Hosted source identity is unverified. No license selected.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/stable-desk/blob/23bac8ff4b5e58cebc4c2665871be4ba02ec250c/README.md) at 23bac8ff4b5e58cebc4c2665871be4ba02ec250c. [Current README](https://github.com/EauDoon/stable-desk/blob/main/README.md).

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. Native routing and paired model quality remain unverified. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/250d8587f240b301cd90d413d5044ae6f8b8fb31/README.md) at 250d8587f240b301cd90d413d5044ae6f8b8fb31. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
