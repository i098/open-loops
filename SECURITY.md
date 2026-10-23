# Security policy

## Current scope

The repository contains browser previews and tooling. Native Tauri, Snowflake and Anthropic integrations are planned, not live. Security fixes are considered for the current `main` branch; there is no published version-support or response-time guarantee.

## Report privately

**Private reporting contact and process: TBD.** Do not assume GitHub private vulnerability reporting is enabled. Do not put exploit details, credentials, personal records or private screenshots in a public issue.

Until a private channel is published here, use a public issue only to request a private contact route, without sensitive details. Do not send credentials to a person or destination whose ownership you have not verified.

For an ordinary non-sensitive bug, use the [bug form](https://github.com/i098/open-loops/issues/new?template=bug_report.yml).

## Safe report contents

Once a private channel is confirmed, include the affected commit, component, expected and observed behavior, a minimal reproduction using synthetic data, and the suspected impact. Redact tokens and personal information. Test only systems and accounts you are authorized to use.

If a credential was exposed, revoke or rotate it through its provider. Deleting it from a comment or commit is not sufficient.

## Release blockers

Maintainers must choose and publish the private reporting channel, security owner, disclosure process and supported-version policy before claiming a complete security program. These decisions are tracked in [OSS readiness](docs/OSS_READINESS.md).
