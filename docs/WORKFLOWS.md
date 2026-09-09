# Repeatable project discovery

These offline commands print JSON for inspection or redirection. They never query accounts or run a project. All input files use UTF-8 JSON, reject duplicate object members and share the regular-file 1 MiB limit. Existing discovery commands are unchanged.

## Compare a public inventory

`node cli.mjs inventory PUBLIC-INVENTORY.json` compares a supplied public-only snapshot with the assessed catalog. It lists catalog entries absent from that snapshot and public ids that need assessment. It never infers why a name is absent or changes the catalog.

Input shape: `{"owner":"EauDoon","repositories":[{"id":"example-project","public":true}]}`. Every row must explicitly be public. Supply a complete public-only inventory for a complete comparison; the tool does not authenticate its completeness or truth. Keep your source inventory outside the repository. Do not supply private records.
