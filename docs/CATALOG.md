# Public project catalog

Assessed 09-09-2026. Static public-source assessment. Runtime and privacy labels describe documented workflows, not a security audit or verified deployment. The profile and Hermes Agent entries retain explicit earlier snapshots; other source revisions can also lag later main changes.

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
| [agent-action-stack](https://github.com/EauDoon/agent-action-stack) | Synthetic agent-action reference path with guided scenarios, saved-case inspection and evidence replay\. | node, python, browser | local-after-setup |
| [agent-team-os](https://github.com/EauDoon/agent-team-os) | Installable specialist-workflow skill with offline routing-plan, evidence and handoff checks\. | assistant, python | configuration-dependent |
| [connect\.md](https://github.com/EauDoon/connect.md) | Browser profile/resume Markdown builder with local revision checkpoints and review exports; optional network source\. | browser, node | configuration-dependent |
| [consequence-rail](https://github.com/EauDoon/consequence-rail) | Recourse-gated synthetic execution with signed settlement review, comparison and fault exercises\. | node | local-after-setup |
| [constitutional-agent-testbench](https://github.com/EauDoon/constitutional-agent-testbench) | Deterministic policy evaluation, precedence tracing, regression fixtures and digest-bound receipts\. | python | local-after-setup |
| [crypto-research-desk](https://github.com/EauDoon/crypto-research-desk) | Research workflow and browser forecast workbench with evidence review, revision comparison and exports\. | browser, node, assistant | configuration-dependent |
| [decision-labs](https://github.com/EauDoon/decision-labs) | Local-first browser workbenches for partnerships, pooled buying, agreements and liquidity\. | browser, node | local-after-setup |
| [EauDoon](https://github.com/EauDoon/EauDoon) | Public profile with an offline searchable project catalog, comparisons and task shortlists\. | markdown, node | public-content |
| [hermes-agent](https://github.com/EauDoon/hermes-agent) (fork) | Fork of Nous Research Hermes Agent with terminal and gateway workflows\. | python, node | provider-dependent |
| [hermes-parallel-followups](https://github.com/EauDoon/hermes-parallel-followups) | Patches for Hermes message boundaries and optional parallel follow-ups\. | python | configuration-dependent |
| [llms-txt-personal-site](https://github.com/EauDoon/llms-txt-personal-site) | Static personal-site template with llms\.txt, article feeds, local search and reproducible build review\. | python | public-content |
| [mandatebound](https://github.com/EauDoon/mandatebound) | Offline commerce evidence readiness, dispute replay and operator triage with review exports\. | node | local-after-setup |
| [operator-labs](https://github.com/EauDoon/operator-labs) | Independent offline Python tools for synthetic payment routes and trace privacy checks\. | python | local-after-setup |
| [orbio-starter](https://github.com/EauDoon/orbio-starter) (fork) | Forked TypeScript model-call examples with deterministic offline fixtures and explicit live mode\. | node | configuration-dependent |
| [reflection-engine](https://github.com/EauDoon/reflection-engine) (fork) | Fork of Kevin Rose's reflection prompt with a bounded edition and offline packet/review tools\. | assistant, node | configuration-dependent |
| [unconventional-moves](https://github.com/EauDoon/unconventional-moves) | Decision skill and offline Python workflow for bounded experiment plans, review and reported outcomes\. | assistant, python | configuration-dependent |

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

Category: action-systems. [Assessed README](https://github.com/EauDoon/agent-action-stack/blob/8bd8b203e6781d4f2acb07be6ed6dbb75502fca8/README.md) at 8bd8b203e6781d4f2acb07be6ed6dbb75502fca8. [Current README](https://github.com/EauDoon/agent-action-stack/blob/main/README.md).

### agent-team-os

Local checks inspect supplied records; the skill is an instruction layer, not a permission or execution boundary. Assistant data handling depends on the chosen provider.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/agent-team-os/blob/36d21b5fab87b8e69cfd86907ce6084c07576253/README.md) at 36d21b5fab87b8e69cfd86907ce6084c07576253. [Current README](https://github.com/EauDoon/agent-team-os/blob/main/README.md).

### connect.md

Guest drafts and checkpoints live in browser memory; exports can be sensitive. Optional network routes require separate configuration; deployment remains unverified.

Category: publishing. [Assessed README](https://github.com/EauDoon/connect.md/blob/1ab2ba57f08d2520e5f9233da3d2f5eb18df0d33/README.md) at 1ab2ba57f08d2520e5f9233da3d2f5eb18df0d33. [Current README](https://github.com/EauDoon/connect.md/blob/main/README.md).

### consequence-rail

Experimental reference implementation; no guaranteed recovery, insurance or legal compliance.

Category: action-systems. [Assessed README](https://github.com/EauDoon/consequence-rail/blob/2926efe747ca255c5b55242b1bad6aab0ab77613/README.md) at 2926efe747ca255c5b55242b1bad6aab0ab77613. [Current README](https://github.com/EauDoon/consequence-rail/blob/main/README.md).

### constitutional-agent-testbench

Checks declared structure and rules, not free-form reasoning or safety certification.

Category: action-systems. [Assessed README](https://github.com/EauDoon/constitutional-agent-testbench/blob/b74cb786cd84ea85316850a9c36040f903631aa5/README.md) at b74cb786cd84ea85316850a9c36040f903631aa5. [Current README](https://github.com/EauDoon/constitutional-agent-testbench/blob/main/README.md).

### crypto-research-desk

Research only; no trading authority. Browser validation does not authenticate sources or independent review.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/crypto-research-desk/blob/078cd0def40fbe9f73d84357fc88ce6c54b0e62d/README.md) at 078cd0def40fbe9f73d84357fc88ce6c54b0e62d. [Current README](https://github.com/EauDoon/crypto-research-desk/blob/main/README.md).

### decision-labs

Models use declared assumptions; scenario outputs are not quotes or execution authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/decision-labs/blob/cacd654bac5c854ee341698a59d5501f9ad47c6c/README.md) at cacd654bac5c854ee341698a59d5501f9ad47c6c. [Current README](https://github.com/EauDoon/decision-labs/blob/main/README.md).

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

Category: publishing. [Assessed README](https://github.com/EauDoon/llms-txt-personal-site/blob/4b7585e8af2ff7328b7420690c1e2ad4679977cd/README.md) at 4b7585e8af2ff7328b7420690c1e2ad4679977cd. [Current README](https://github.com/EauDoon/llms-txt-personal-site/blob/main/README.md).

### mandatebound

Experimental decision support; legal effect stays not determined. Evidence packs can contain sensitive data.

Category: action-systems. [Assessed README](https://github.com/EauDoon/mandatebound/blob/96206bd1cb5cb48895bb31d12e4cbecfbf82ed2e/README.md) at 96206bd1cb5cb48895bb31d12e4cbecfbf82ed2e. [Current README](https://github.com/EauDoon/mandatebound/blob/main/README.md).

### operator-labs

Synthetic research inputs only; no live routing or payment execution.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/operator-labs/blob/bd153104833d2e4614ee495b80c5fc1fbde72291/README.md) at bd153104833d2e4614ee495b80c5fc1fbde72291. [Current README](https://github.com/EauDoon/operator-labs/blob/main/README.md).

### orbio-starter

Offline package commands use synthetic fixtures. Explicit live mode sends inputs to OpenRouter and may consume credits; the starter does not manage funds.

Category: agent-workflows. [Assessed README](https://github.com/EauDoon/orbio-starter/blob/b7319db76b5c57c62e4dd75d058cfa9764b748b5/README.md) at b7319db76b5c57c62e4dd75d058cfa9764b748b5. [Current README](https://github.com/EauDoon/orbio-starter/blob/main/README.md).

### reflection-engine

The offline companion prepares chosen source episodes locally. Uploading packets shares them with the chosen provider. Sensitive output, not therapy or diagnosis.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/reflection-engine/blob/d8b83c6a0220bd8fb1635f28a76c54d3142ff3a4/README.md) at d8b83c6a0220bd8fb1635f28a76c54d3142ff3a4. [Current README](https://github.com/EauDoon/reflection-engine/blob/main/README.md).

### unconventional-moves

Local tools validate declared plans and reported observations; assistant use follows provider settings. No command runs experiments or grants authority.

Category: decision-methods. [Assessed README](https://github.com/EauDoon/unconventional-moves/blob/389dfc63ca09deeef85989a11db87e02b5327de5/README.md) at 389dfc63ca09deeef85989a11db87e02b5327de5. [Current README](https://github.com/EauDoon/unconventional-moves/blob/main/README.md).
