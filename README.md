# Open Loops

Read [PLAN.md](PLAN.md) for the product contract, Mermaid architecture and onboarding flows, implementation sequence, and acceptance gates.

A quiet macOS companion that turns office loose ends into numbered decisions and explicitly approved, scoped agent work. A swipe is navigation, not permission. Acceptance earns companion XP; only authoritative source readback proves a business outcome.

## Current status — planning checkpoint

**This repository contains plans, not a working native application.** The browser prototype is being revised outside this repository. Its final source and evidence snapshot is pending an explicit `FINAL-READY` signal.

| Deliverable                                                                         | Status                                                                                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Isolated Git repository, README, PLAN, secret/build ignore rules                    | Created in this checkpoint; not staged or committed                                                      |
| Browser companion prototype                                                         | Exists at the canonical source path below; latest UX/onboarding revisions are in flight; not copied here |
| Personal observability / My day browser dashboard                                   | In flight; not copied or independently verified here                                                     |
| Tauri v2 host, Swift helper, SQLite, Keychain, Snowflake, Claude/GPT, source writes | Planned; unimplemented in this repository                                                                |
| Native permissions, signed packaging, real background jobs, real reminders          | Planned; no runtime or verification claim                                                                |

Older 61-check reports and older screenshots describe an earlier design. They are **not evidence for the latest companion, onboarding, Tauri proposal, or dashboard**. New verification must identify the exact final files it exercised.

## Repository contents

- [PLAN.md](PLAN.md): consolidated decisions, data ownership, command boundaries, four-hour vertical slice, and later integration gates.
- [.gitignore](.gitignore): local secrets, runtime data, captures/logs, dependencies, and build outputs. Source previews and plans remain trackable.
- Final prototype, sprite, source-plan snapshots, and verification artifacts: pending; no placeholder files or application scaffold were created.

## Canonical sources awaiting final snapshot

These paths are external working sources, not files delivered inside this repository yet:

| Source                                                   | Role                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| `/Users/xiao/tmp/.lavish/open-loops.html`                | Browser companion prototype; ongoing edits                            |
| `/Users/xiao/tmp/.lavish/redesign-direction.md`          | Latest card, navigation, visual, gesture, and first-run specification |
| `/Users/xiao/tmp/.lavish/screen-context-architecture.md` | Tauri/native ownership, runtime, and Mermaid proposal                 |
| `/Users/xiao/tmp/.lavish/quest-sprite.svg`               | Original Pip / Scout / Guide sprite asset                             |
| `/Users/xiao/tmp/.lavish/personal-observability.html`    | Pending separate My day prototype                                     |

The existing `/Users/xiao/tmp/.lavish/crewship-skills-report.md` records installed-skill provenance. The existing `onboarding-ui-flow.mmd` is a supporting working diagram; its final role will be reconciled at snapshot time.

### Final snapshot protocol

1. Receive `FINAL-READY` with the exact verified source, sprite, dashboard, and evidence filenames.
2. Copy only that approved set into this repository; preserve relative asset references and distinguish current evidence from historical reports.
3. Record source-to-destination paths and byte hashes. Check links, dependency paths, and documented status against the copied bytes.
4. Update this status table and PLAN's handoff section. Then validate and publish to the authorized private GitHub repository. Do not modify the external working originals.

No startup command is advertised yet: no application was scaffolded, and the final browser files have not been copied.

## Decisions that are settled

- **Tauri v2 on macOS, not Electron.** Local HTML/CSS/JS runs in the system WebView; Rust owns privileged behavior and durable state.
- Snowflake supplies scoped read-only office evidence. One approved Claude **or** GPT provider prepares bounded work after exact confirmation.
- A separate approval, current authorization/status checks, and authoritative readback guard every source write.
- Accessibility and screen capture permissions are separate. Capture is optional, user-selected, locally previewed, and separately approved for upload. No silent raw-video upload.
- Local SQLite/FTS stores useful cited memory and deterministic records; Keychain stores credentials. No vector database or separate telemetry infrastructure.

## Git initialization receipt

The target directory did not exist when inspected. Only `/Users/xiao/tmp/open-loops` was created and initialized. Neither `/Users/xiao/tmp` nor `.lavish` was initialized by this workstream.

Command executed:

```sh
mkdir /Users/xiao/tmp/open-loops && git -C /Users/xiao/tmp/open-loops init && git -C /Users/xiao/tmp/open-loops rev-parse --show-toplevel
```

Exact command output:

```text
Initialized empty Git repository in /Users/xiao/tmp/open-loops/.git/
/Users/xiao/tmp/open-loops
```

The second line is the one-time exact-root verification. No staging or publication occurred during this initial documentation checkpoint. The user subsequently authorized commits, pushes, private GitHub publication, and path-aware CI/CD.

## Authorized publication and CI

The private repository [i098/open-loops](https://github.com/i098/open-loops) has been created and configured as `origin`. Final verified sources are still pending; nothing has been pushed yet. Publication waits for the final snapshot and actual checks.

Every pull request and main push will run path detection and the stable `PR gate`. Relevant formatting, linting, browser tests, and real Sentrux checks must pass; irrelevant checks may skip. Main builds a downloadable preview bundle as continuous delivery. No hosted deployment or native application build is implied. See [CI documentation](docs/CI.md) for the source-path matrix, provenance, and exact verification status.

## Remaining facts, not assumptions

Final evidence filenames, verified browser behavior, and final dashboard assets await `FINAL-READY`. Live Snowflake account/views/actor scope, the approved provider/model, authorized source connector, retention policy, and macOS signing identity/minimum OS remain integration prerequisites. The four-hour estimate is conditional, not a claim these prerequisites or integrations already exist.
