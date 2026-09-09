# Public project catalog

Assessed 09-09-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security audit or verified deployment. Source revisions can predate current main.

Generated from [catalog.json](../catalog.json). For search, filters, comparison and task coverage, see the [discovery guide](DISCOVERY.md).

Runtime labels list supported workflows or prerequisites, not interchangeable runtimes. Read each assessed README for versions and setup.

## Data boundary labels

- `local-after-setup`: documented core workflow runs locally; obtaining dependencies may need a network. Local files can still be sensitive.
- `provider-dependent`: the selected assistant/model provider and enabled tools determine data handling.
- `configuration-dependent`: different workflows or optional integrations have different boundaries.
- `public-content`: the workflow reads or builds content intended for publication; publishing remains a separate action.

## Browse projects

| Project | Purpose | Runtime | Data boundary |
| --- | --- | --- |
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | Reference demo composing policy evaluation, synthetic recourse and dispute review\. | node, python | local-after-setup |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Installable skill for bounded specialist work and independent review\. | assistant | provider-dependent |
| [connect\.md](https://github.com/EauDoon/connect.md) | Browser Markdown profile/resume builder with optional network functionality in source\. | browser, node | configuration-dependent |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | Recourse reservation, synthetic action execution and signed settlement receipts\. | node | local-after-setup |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic structured-output policy evaluation and precedence tracing\. | python | local-after-setup |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | Research workflow and browser workbench for structured forecast packets\. | browser, node, assistant | configuration-dependent |
| [decision-labs](https://github.com/EauDoon/decision-labs) | Local-first browser workbenches for partnerships, pooled buying, agreements and liquidity\. | browser, node | local-after-setup |
| [EauDoon](https://github.com/EauDoon/EauDoon) | Public profile and project entry points\. | markdown | public-content |
| [hermes-agent](https://github.com/EauDoon/hermes-agent) (fork) | Fork of Nous Research Hermes Agent with terminal and gateway workflows\. | python, node | provider-dependent |
| [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) | Patches for Hermes message boundaries and optional parallel follow-ups\. | python | configuration-dependent |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | Static personal-site template with Markdown, llms\.txt and structured data\. | python | public-content |
| [mandatebound](https://github.com/EauDoon/mandatebound) | Offline signed commerce evidence readiness and deterministic dispute replay\. | node | local-after-setup |
| [operator-labs](https://github.com/EauDoon/operator-labs) | Independent offline Python tools for synthetic payment routes and trace privacy checks\. | python | local-after-setup |
| [orbio-starter](https://github.com/EauDoon/orbio-starter) (fork) | Forked TypeScript examples for model calls and tool workflows\. | node | provider-dependent |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) (fork) | Fork of Kevin Rose's prompt for evidence-grounded personal reflection\. | assistant | provider-dependent |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | Installable decision skill for practical approaches and bounded reversible tests\. | assistant | provider-dependent |

## Start with a task

| Task | Projects |
| --- | --- |
| build-model-example | [orbio-starter](https://github.com/EauDoon/orbio-starter) |
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

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/964f438d4794a387b955c6cc658729f979e8b6ec/README.md) at 964f438d4794a387b955c6cc658729f979e8b6ec. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Instructions do not grant tools or authority; data handling depends on the assistant.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/8099ff0337bd07c81347923229c29ad45833e63f/README.md) at 8099ff0337bd07c81347923229c29ad45833e63f. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts are local; optional network routes require separate configuration. Deployment state is unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/5a49016904fb8c1743aa2db72acbefe0b77ab214/README.md) at 5a49016904fb8c1743aa2db72acbefe0b77ab214. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/6c61e9fdcd1a4701afad1d2371abcb3f13bbab57/README.md) at 6c61e9fdcd1a4701afad1d2371abcb3f13bbab57. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/16b2faa71b0f92b9afa15b13afad8c48da8132f4/README.md) at 16b2faa71b0f92b9afa15b13afad8c48da8132f4. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Browser validation does not authenticate sources or independent review.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/4761608a2e782e7791d55dc1c2749280404c1af0/README.md) at 4761608a2e782e7791d55dc1c2749280404c1af0. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Models use declared assumptions; scenario outputs are not quotes or execution authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/cacd654bac5c854ee341698a59d5501f9ad47c6c/README.md) at cacd654bac5c854ee341698a59d5501f9ad47c6c. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

### EauDoon

A curated public snapshot, not certification or a live inventory service.

Category: discovery. [Assessed README](https://github.com/EauDoon/EauDoon/blob/ee8ba9b5acedd2a15d059b64ea616c0d2da7ad71/README.md) at ee8ba9b5acedd2a15d059b64ea616c0d2da7ad71. [Current README](https://github.com/EauDoon/EauDoon/blob/main/README.md).

### hermes-agent

Model providers and enabled integrations define data access and external actions. Fork source is not an endorsed upstream release.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-agent/blob/4a7e28483f486c7096e74b06ebc203b643820667/README.md) at 4a7e28483f486c7096e74b06ebc203b643820667. [Current README](https://github.com/EauDoon/hermes-agent/blob/main/README.md).

### hermes-parallel-followups

Version-sensitive source patches; inspect compatibility before modifying an installation.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/hermes-parallel-followups/blob/83cac97c1d817e3199c6ccb8d2c7317631418e2a/README.md) at 83cac97c1d817e3199c6ccb8d2c7317631418e2a. [Current README](https://github.com/EauDoon/hermes-parallel-followups/blob/main/README.md).

### llms-txt-personal-site

Generated output is public when deployed; local build does not configure hosting or guarantee indexing.

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/551b4e0413ce0a4ee206cdc76f66e8e74ad4a138/README.md) at 551b4e0413ce0a4ee206cdc76f66e8e74ad4a138. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/e526c4c32ac61571757a98ca1a69189821c3dce7/README.md) at e526c4c32ac61571757a98ca1a69189821c3dce7. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/eac7bffea37230800ba20a0bad2098448746d1df/README.md) at eac7bffea37230800ba20a0bad2098448746d1df. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### orbio-starter

Examples can call paid model services and external tools. Review the upstream setup and scope first.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/orbio-starter/blob/28b87222731ed728fc7b61af1df0705c900e907f/README.md) at 28b87222731ed728fc7b61af1df0705c900e907f. [Current README](https://github.com/EauDoon/orbio-starter/blob/main/README.md).

### reflection-engine

Chosen assistant processes personal context; output is sensitive, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/f60aa562fbb77a731aa8f7e39312141e111ecea2/README.md) at f60aa562fbb77a731aa8f7e39312141e111ecea2. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### unconventional-moves

A planning method; suggested actions still need appropriate user authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/9b8839db172eb5094bab6fd9276408faf1098760/README.md) at 9b8839db172eb5094bab6fd9276408faf1098760. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
