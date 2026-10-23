# OSS publication readiness

This repository is public. Public access does not establish an open-source license. The items below separate available contributor documentation from decisions the owner still needs to make.

## Available

| Item                                          | Location                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Preview setup and project boundary            | [README](../README.md)                                                                                  |
| Contribution workflow and check commands      | [CONTRIBUTING](../CONTRIBUTING.md)                                                                      |
| Support, security and conduct guidance        | [SUPPORT](../SUPPORT.md), [SECURITY](../SECURITY.md), [CODE_OF_CONDUCT](../CODE_OF_CONDUCT.md)          |
| Bug/feature forms and PR template             | [.github/ISSUE_TEMPLATE](../.github/ISSUE_TEMPLATE), [PR template](../.github/PULL_REQUEST_TEMPLATE.md) |
| Unreleased changes and third-party provenance | [CHANGELOG](../CHANGELOG.md), [CREDITS](../CREDITS.md)                                                  |
| Quality gates and delivery evidence           | [CI](CI.md), [local verification](verification/local-checks.md)                                         |
| Native product scope and implementation gates | [PLAN](../PLAN.md), [implementation contract](implementation-plan.md)                                   |

The CI workflow, browser tests and bundle are implemented. Tauri, native sensing, Snowflake and Anthropic integration remain planned. No stable release or installer is claimed.

## Owner decisions still required

| Decision                                                      | Status and consequence                                                                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project license and contribution terms                        | **TBD.** Do not label the project MIT, Apache, FSL or OSI open source until the owner selects and publishes terms. No placeholder LICENSE file is provided. |
| Imported artwork/source reuse rights                          | **TBD.** Review the [recorded provenance](verification/snapshot.json) and third-party terms before relicensing or redistribution.                           |
| Private vulnerability-reporting channel and security owner    | **TBD.** Follow [SECURITY](../SECURITY.md); do not send sensitive reports to a public issue.                                                                |
| Named maintainers and conduct-reporting contact               | **TBD.** Do not infer a support team or private contact from the repository owner account.                                                                  |
| Supported versions, release process and response expectations | **TBD.** Current guidance applies to the preview on main; no release support window or SLA is promised.                                                     |

## Before describing this as a licensed open-source release

1. Choose the license and contribution terms; publish the real license text and confirm imported-material rights.
2. Configure a private security-reporting route and publish its verified instructions.
3. Confirm maintainers, conduct escalation and version-support policy.
4. Run the applicable gates, check the downloaded bundle's manifest, and review the public docs for private data.
5. Document a release process only when one exists; do not infer a native release from a browser bundle.

This checklist does not authorize a license choice, account-setting change, secret transfer or release publication.
