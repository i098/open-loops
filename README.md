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
- **Target native product:** Tauri v2/macOS system WKWebView, Rust-owned jobs/state, SQLite/FTS, and Keychain credentials. The selected live stack is **Snowflake SQL API + Anthropic Claude Messages API**, not a provider-choice framework. The [implementation contract](docs/implementation-plan.md) specifies protocols, schemas, transactions, command permissions, and ordered native acceptance gates. Optional Swift AX/ScreenCaptureKit context remains separately gated. These integrations are planned, not implemented; Chromium is only the browser-preview test engine.

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

These commands reproduce the verified Node 24 CI toolchain. Local preference is Bun (`bun run <script>`, `bunx <tool>`) with the already pinned dependencies; no CI/lockfile migration is implied.

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

Verified [full hosted app run](https://github.com/i098/open-loops/actions/runs/40026691480) and [downloadable preview artifact](https://github.com/i098/open-loops/actions/runs/40026691480/artifacts/12533471126). Source hashes and local checks are in [verification](docs/verification/local-checks.md); the expanded native implementation plan remains a specification, not a hosted deployment or live integration.

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

The planned core needs approved Snowflake OAuth/actor-scoped views and a dedicated Anthropic Messages API credential, exact accessible Claude model, and data/budget policy. Neither agent-host login nor a Claude Code/Codex subscription token substitutes for that API credential. Optional manual export needs no model key. Source writes, native sensing and signed distribution have their own authorization/retention/macOS prerequisites; missing inputs remain explicit stop gates.
