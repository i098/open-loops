# Contributing

Open Loops currently contains browser previews, tests and a native implementation plan. It does not contain a working Tauri application.

Open Loops is licensed under [GPL-3.0-or-later](LICENSE); contributions are accepted under the same terms (inbound = outbound). Discuss substantial code contributions with the repository owner before submitting them. Do not add a CLA or DCO policy on the owner's behalf. Track the remaining decisions in [OSS readiness](docs/OSS_READINESS.md).

## Start with a bounded change

Use the [bug report](https://github.com/i098/open-loops/issues/new?template=bug_report.yml) or [feature request](https://github.com/i098/open-loops/issues/new?template=feature_request.yml) form. Explain the observed problem before proposing a replacement design. For sensitive reports, follow [SECURITY.md](SECURITY.md).

Keep one concern per pull request. Preserve the current interaction contract unless the change explicitly revises it: independent buddy/info/deck geometry, readable 5:7 cards, external Back, retained drag placement, explicit acceptance and honest fixture labels.

## Local checks

Use Node 24 or newer, Bun and Python 3. The repository keeps `package-lock.json`; a Bun lockfile migration is a separate change.

```sh
npm ci --ignore-scripts
bunx --no-install playwright install chromium
bun run format
bun run format:check
bun run lint:code
bun run lint:docs
bun run test
bun run test:ui
bun run check:sentrux
bun run bundle
```

Run commands from the repository root. `npm ci` installs the committed dependency graph; Bun is the preferred local script runner. Hosted CI uses Node 24. See [CI.md](docs/CI.md) for path selection and the required `PR gate`.

For docs-only changes, formatting and Markdown checks are the local minimum. Changes to runtime files, tests, import/bundle tooling or CI need the applicable full gates. Do not skip tests, raise strict Sentrux limits or add a baseline to hide failures.

## Pull requests

Describe the change, why it is needed, and the exact checks run. Separate local results from hosted CI results. Include a screenshot for visible changes and the relevant interaction test. Use a descriptive title; no automated merge is expected.

Do not include API keys, login tokens, private workspace records, raw screen captures or unredacted logs. Use synthetic examples. The planned app's API credentials are separate from coding-agent subscriptions.

Keep changed documentation and links current. If imported preview assets change, update [snapshot provenance](docs/verification/snapshot.json) and [verification notes](docs/verification/local-checks.md) without inventing unexecuted results. Add a short entry under `Unreleased` in [CHANGELOG.md](CHANGELOG.md) for user-facing changes; there is no release automation or changelog-fragment requirement yet.

## Repository map

- `previews/`: delivered HTML, CSS, JavaScript and sprite assets.
- `tests/`: rendered browser interaction tests.
- `scripts/`: import, policy, quality-gate and bundle tooling.
- `docs/`: design, implementation contracts and verification evidence.
- `.github/workflows/`: hosted quality and preview delivery.

Native files in the [implementation plan](docs/implementation-plan.md) are future work, not an existing scaffold. A native change must add real build/test gates and actual WKWebView evidence; Chromium preview success alone is not native proof.

Follow the [code of conduct](CODE_OF_CONDUCT.md). Maintainer assignments and response targets remain TBD.
