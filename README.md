# Open Loops

Run the browser previews from this directory:

```sh
python3 -m http.server 4173 --directory previews
```

Open [the companion](http://127.0.0.1:4173/open-loops.html) or [My day](http://127.0.0.1:4173/personal-observability.html). The companion's **Design & architecture** view contains the Mermaid proposal. The previews use pinned external style/diagram libraries, so allow internet access for those assets.

**Browser prototypes plus plans, not a working native app.** Records, scans, demo jobs, and source receipts are synthetic. There are no Snowflake/model API/native integrations. Explicit Copy/Open actions only copy the reviewed prompt and open a fixed Claude or Codex page for manual paste; they never submit or execute it. External tools retain their own permissions; the proposed app sandbox cannot control them or guarantee a run or completion.

## What this is

A quiet macOS companion that turns office loose ends into numbered decisions and explicitly scoped agent work. The actual card has a 5:7 poker ratio with circular red-X/green-check actions and no shadows. A swipe is navigation, not permission. Acceptance earns companion XP; authoritative source readback alone proves a business outcome.

- **Companion:** a positionable buddy, an independent info card always below the displayed buddy, and a separately positioned 5:7 decision deck. Near the bottom edge, order is deck including circular actions, buddy, info; only the info card follows an open buddy drag. Includes progressive scripted first-scan activity, precomputed choices, a prefilled prompt editor, explicit handoff/approval, and Pip/Scout/Guide progression. Placement is browser-session state, not a native integration.
- **My day:** separate example timeline, filters, agent outcomes, and memory provenance. Observed, inferred, and demo records are distinct.
- **Target native product:** Tauri v2/macOS with separate buddy/info/deck windows and an optional normal My day window. Local HTML/CSS/JS WebViews have per-window capabilities; Rust owns state/jobs/commands, SQLite/FTS, and Keychain access. An optional signed Swift AX/ScreenCaptureKit helper handles approved local context. **Not Electron.** These integrations are planned, not implemented.

## Plans and evidence

| Read                                                    | Contents                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [PLAN.md](PLAN.md)                                      | Product decisions, four-hour development slice, and implementation gates                |
| [Architecture](docs/architecture.md)                    | Canonical Mermaid architecture, async runtime, and onboarding tree                      |
| [UI design](docs/ui-design.md)                          | Full-size portrait cards, external Back/info Close, gestures, and first-run behavior    |
| [Implementation reference](docs/implementation-plan.md) | File/module sequence, data ownership, command validation, memory/privacy, and packaging |
| [CI and publication](docs/CI.md)                        | Path-aware checks, actual Sentrux findings, artifact delivery, and protection limits    |

Source imports extract inline JS/CSS into `previews/assets/` for real analysis. They are **not byte-identical copies** of the original HTML. [Source hashes and transformations](docs/verification/snapshot.json) and [local-check receipts](docs/verification/local-checks.md) must identify the exact revision they cover. This page makes no final-pass claim; the older 61-check report is not current proof.

## Development checks

Use Node 24 or newer:

```sh
npm ci --ignore-scripts
npm run format:check
npm run lint
npm test
npx playwright install chromium
npm run test:ui
npm run check:sentrux
npm run bundle
```

The browser suite exercises rendered interactions, not source-text markers. Sentrux uses the genuine pinned 0.5.7 binary and grammar, strict rules, and positive application-JS coverage. The bundle is `dist/open-loops-preview.tar.gz` with a SHA-256 manifest; its preview server command is the same Python command above.

## GitHub and current delivery boundary

Repository: [i098/open-loops](https://github.com/i098/open-loops). [Draft PR #1](https://github.com/i098/open-loops/pull/1) publishes the verified previews and plans from `feat/verified-previews-ci`; it is not merged. The repository was created private, but a later API read returned `private: false`, `visibility: public`. That unexpected external change was reported and preserved; this workstream did not change visibility. No automatic merge or hosted deployment is authorized.

Verified [full hosted run](https://github.com/i098/open-loops/actions/runs/40026326590) and [downloadable preview artifact](https://github.com/i098/open-loops/actions/runs/40026326590/artifacts/12533246114). Source hashes and current local checks are in [verification](docs/verification/local-checks.md); this is a browser preview, not a hosted deployment.

Every PR and main push runs path detection and the stable **PR gate**. Relevant formatting, lint, browser/policy tests, and Sentrux must succeed; irrelevant jobs may skip. Changes to packaged inputs create a downloadable review artifact on PRs and a continuous-delivery artifact on main. Unrelated changes do not rebuild the preview.

**Main is protected:** the exact `PR gate` context is required, branches must be up to date, administrators are included, and changes require a PR with zero human approvals. The policy was applied after a GET confirmed no existing protection and then verified by GET. No extra reviewer policy, auto-merge, or visibility change was introduced.

## Initialization receipt

The target directory was absent when inspected. Only `/Users/xiao/tmp/open-loops` was created and initialized. Neither its crowded parent nor `.lavish` was initialized.

```sh
mkdir /Users/xiao/tmp/open-loops && git -C /Users/xiao/tmp/open-loops init && git -C /Users/xiao/tmp/open-loops rev-parse --show-toplevel
```

Exact output:

```text
Initialized empty Git repository in /Users/xiao/tmp/open-loops/.git/
/Users/xiao/tmp/open-loops
```

The second line is the one-time exact-root verification. The original planning-only checkpoint did not stage or commit. The user subsequently authorized the private repository, commits/pushes, PR, and CI/CD. No destructive history changes were made.

## Remaining live-integration prerequisites

Clipboard/manual-paste handoff needs no model API key. Live evidence needs approved Snowflake views and actor scope; an optional API runner separately needs one chosen provider/model and data policy. Real source writes need a separately authorized source API. Native context and release also need an app allowlist, retention policy, macOS targets, and signing credentials. Missing prerequisites remain explicit blockers, never simulated live success.
