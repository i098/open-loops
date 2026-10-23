# GitHub, CI, and preview delivery

## Current publication state

The user authorized commits, private GitHub publication, CI/CD, and required PR checks after the initial documentation-only checkpoint. Earlier no-commit/no-push restrictions no longer apply to this publication workstream. Destructive history changes, public disclosure, native releases, and unapproved source writes remain outside scope.

Authenticated GitHub user: `i098`. `repos/i098/open-loops` initially returned HTTP 404. The new [i098/open-loops](https://github.com/i098/open-loops) repository was created **private**, its visibility was confirmed, and local `origin` is `https://github.com/i098/open-loops.git`. No unrelated existing repository was reused. Final source synchronization, local checks, first push, Actions verification, and branch protection are still pending at this checkpoint.

The actual application deliverable is a **browser prototype plus plans**, not a Tauri application. CI must not invent a Cargo build for absent native sources.

## Repository conventions

| Path                                                                                               | Purpose                                                                         |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `previews/open-loops.html`, `personal-observability.html`, optional `open-loops-architecture.html` | Same-basename browser entry points; preserve relative navigation                |
| `previews/assets/`                                                                                 | Extracted first-party JS/CSS; required local assets; no private screenshots     |
| `previews/quest-sprite.svg`                                                                        | Shared sprite when needed by the verified source                                |
| `docs/architecture.md`, `docs/ui-design.md`, `docs/verification/`, `docs/images/`                  | Canonical detailed plans, selected final proof, and approved review screenshots |
| `scripts/`, `tests/ui.spec.mjs`, `playwright.config.mjs`                                           | Portable CI policy, checks, bundling, and real browser tests                    |

Inline application JS/CSS must be extracted into repo-local files so ESLint and Sentrux analyze the application, not an empty HTML shell. Snapshot records must disclose this transformation and record original and final hashes. Source `.lavish` originals remain untouched. Recheck the transformed repository copy in a real browser; original-source tests alone do not establish its behavior.

## Source-path matrix

The workflow starts on every PR, every main push, and manual dispatch. There is **no top-level `paths` or `paths-ignore` filter** that can leave a required check pending.

| Changed input                                                                                             | Format                                | Lint          | Browser / policy tests | Sentrux                   |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------- | ---------------------- | ------------------------- |
| Workflow, scripts, lockfile/package, Node version, lint/format/test/Sentrux config, Git ignore/attributes | Run                                   | Code and docs | Run                    | Run                       |
| Application HTML / JS / CSS                                                                               | Run                                   | Code          | Run                    | Run                       |
| Tests                                                                                                     | Run for supported text                | Code for JS   | Run                    | Run for source extensions |
| Markdown docs only                                                                                        | Run                                   | Markdown only | Skip                   | Skip                      |
| Preview SVG/image asset only                                                                              | Skip if formatter does not support it | Skip          | Run                    | Skip                      |
| Review screenshot or unrelated binary only                                                                | Skip                                  | Skip          | Skip                   | Skip                      |

JSON and YAML are parsed by Prettier as part of the format check. ESLint checks actual JS for undefined names and unsafe/invalid constructs. HTML validation checks structure/duplicate IDs and attributes; Stylelint checks CSS syntax/invalid properties and values. Markdownlint checks heading progression, fenced-code language/spacing, and empty links. These are focused correctness rules, not a claim of complete accessibility or security analysis.

The path detector reads actual Git base/head changes using `git diff --name-only -z`; the initial main push or manual dispatch with no base considers all tracked files. Renames/deletions are conservative: both affected paths may trigger checks. The detector and final gate have executable behavior tests; workflow YAML is parsed into a semantic model for policy assertions.

## Stable required gate

Job name: **`PR gate`**. It depends on `detect`, `format`, `lint`, `test`, and `sentrux` and uses `if: always()`.

- Detection must succeed and emit valid selections.
- Every relevant check must finish `success`. Failure, cancellation, missing results, or an unexpected skip fails the gate.
- Truly irrelevant jobs may finish `skipped`; a failed or cancelled irrelevant job is not silently ignored.
- Docs-only PRs still receive the stable gate, while unnecessary browser/Sentrux work skips.
- Main delivery depends on gate success. No `continue-on-error`, warning-only Sentrux, or fake successful fallback is permitted.

Configure branch protection to require `PR gate` after the initial commit/run exists, when the account/repository supports protection. Confirm the API response and effective rule; a local YAML file does not establish protection. If GitHub's plan restricts private-repository protection, report the exact API error instead of claiming it was installed.

## Untrusted PRs and pins

The workflow uses `pull_request`, never `pull_request_target`. It grants only `contents: read`, persists no checkout credentials, and uses no repository secrets. Fork code receives no publication token. Delivery is limited to a successful **main push**, not a fork PR. Action code is pinned to real commits fetched through the GitHub API:

| Action                    | Fetched ref | Immutable commit                           |
| ------------------------- | ----------- | ------------------------------------------ |
| `actions/checkout`        | v4          | `11d5960a326750d5838078e36cf38b85af677262` |
| `actions/setup-node`      | v4          | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| `actions/upload-artifact` | v4          | `ea165f8d65b6e75b540449e92b4886f43607fa02` |

Node 24 is the CI toolchain; exact npm dev dependencies are committed with a lockfile and installed with `npm ci --ignore-scripts`. Local host Node was v26.12.1 during installation; local results must identify any difference from CI rather than implying an identical runtime.

## Real Sentrux, not a zero-source check

Tool: installed Sentrux **0.5.7**; upstream release `v0.5.7`. The pinned Crewship quality-gates policy is at commit `9897a9c845f7a7cdb3ab2dbb685ec647aa8c10d6`. Its claim that degraded gate exits 2 is outdated for this binary: v0.5.7 degraded/error paths exit 1. **Every nonzero exit is a failure.**

The research worker proved why a naive check is unsafe:

| Experiment                                                    | Actual result                                                                                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Empty source directory with rules                             | Exit 0, quality 10000, zero files; not acceptable application coverage                                                |
| HTML-only source with inline script                           | Exit 0, quality 10000, one file; inline application JS not analyzed                                                   |
| Temporary extraction of in-flight companion/dashboard scripts | Seven real JS files, 471 lines, quality 8465; strict check failed at `render`, cyclomatic complexity 29 over limit 25 |
| `gate` without a baseline                                     | Exit 1; no automatic successful baseline                                                                              |
| `gate --save`, then unchanged gate                            | Explicit baseline save succeeds; unchanged comparison succeeds                                                        |

These experiments establish the tool behavior, **not final application acceptance**. The source owner is handling the measured render-complexity issue before final readiness. No threshold increase or artificial baseline is authorized to conceal it.

The CI runner must obtain the exact pinned binary and JavaScript grammar, disable telemetry before invoking it, require nonempty extracted application JS, and fail if source coverage is empty. Rules retain `max_cycles = 0`, `max_cc = 25`, and `max_fn_lines = 100`; actual final findings must be resolved or reported. Do not create/save a PR baseline and call it regression protection.

Pinned Linux x86-64 release digests, fetched from GitHub release metadata:

```text
sentrux-linux-x86_64
3237f80fe20d54aad4deefa8a143f0d60543bb5d2d6ad891eb42432f155725a6
grammars-linux-x86_64.tar.gz
8849f1eb07df3f6d4ea1ed422d8dee4b9b79a250682fa5646675dae466554454
```

Do not execute upstream `install.sh`: even at this tag, it discovers `releases/latest` and installs globally. Use checked release bytes in isolated tool storage instead. The dedicated research note will supply the final exact runner recipe. No license/authentication blocker was observed with a clean tool home.

## Continuous delivery, not assumed hosting

After a successful main-push gate, `scripts/bundle.mjs` creates `dist/open-loops-preview.tar.gz`. It contains the verified preview files, approved docs, and a per-file SHA-256 manifest bound to the GitHub commit. The workflow uploads this as `open-loops-preview-<commit>` for **30 days**.

This is an actual downloadable artifact, not an unconfigured deployment promise. It is **continuous delivery of the browser preview**. No Pages URL, native installer, public website, or GitHub Release is claimed. Pages may be considered later only if private-repository/account capabilities and intended audience are verified. GitHub Actions artifact access follows repository permissions; public disclosure is not the default.

## Commands and verification record

Commands already executed in this workstream:

```sh
npx -y gh-axi api user --jq '{login: .login, plan: .plan.name}'
npx -y gh-axi api repos/i098/open-loops --jq '{full_name, private, default_branch, html_url, description, permissions}'
npx -y gh-axi repo create open-loops --private --description 'Open Loops browser prototypes and Tauri macOS implementation plans'
npx -y gh-axi repo view --repo i098/open-loops
git remote add origin https://github.com/i098/open-loops.git
sentrux --help
sentrux check --help
sentrux gate --help
sentrux --version
npm install --ignore-scripts
```

Observed: user `i098`; initial repository 404; created repository confirmed private; Sentrux 0.5.7; 249 npm packages installed. No credentials were written to repository docs. Initial npm engine warning reflected Node26 versus the first proposed strict Node24 range; package support now allows Node24 and newer while CI remains on Node24.

Final local formatting/lint, policy tests, transformed-copy browser tests, nonempty-source Sentrux, archive build, exact commit/push, GitHub run conclusions, artifact download, and protection API results are **not yet recorded**. Replace this pending section with actual results after `FINAL-READY`, not predictions.
