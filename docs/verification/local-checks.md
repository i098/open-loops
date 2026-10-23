# Final repository-copy verification

This report covers the transformed `previews/` files, not an earlier `.lavish` revision. [snapshot.json](snapshot.json) records source, delivered-file, and screenshot SHA-256 values.

## Verified source identity

- Companion: `8355703b732dfbe9126e824283bd1ea9583247c641885b4ef4f26e8b9ef157d1` (inert native-plan text synchronized; application JS/CSS unchanged from `d118f783…`).
- My day: `ed789a3d7d6eebe6a50758efd06beae2cc28b8f84aadabbb49ada8b284dac7ac`.
- Shared sprite: `2d2bf1d2bf100c94591d61b19f60c592295890c7fce82339b8a5f768ad5f84db`, copied unchanged and excluded from formatting.

HTML imports extract executable JS/CSS, rebase relative CSS URLs, retain execution order, and format the repository copy. They are not byte-identical HTML copies. Native Tauri/Rust/Swift/SQLite integration remains proposed, not implemented.

## Executed final gates

| Command                                  | Actual result                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `bun run format`                         | Completed using pinned Prettier; original source files untouched by formatting                         |
| `bun run format:check`                   | Pass                                                                                                   |
| `bun run lint:code`, `bun run lint:docs` | ESLint, HTML validation, Stylelint, Markdownlint pass                                                  |
| `bun run test`                           | 13 policy/import tests pass; zero skipped                                                              |
| `bun run test:ui`                        | All 9 Chromium tests pass in 12.7 seconds; zero skipped/retried                                        |
| `bun run check:sentrux`                  | Sentrux 0.5.7: all 3 strict rules pass; 3 application JS / 12 total first-party JS files; quality 6840 |
| `bun run bundle`                         | Created `dist/open-loops-preview.tar.gz` with per-file SHA-256 manifest                                |

Final local commands used Bun 1.4.2 as the script runner with the already pinned dependencies; Node-based tools ran on Node v26.12.1. Hosted CI remains Node 24, unchanged. Strict limits remain `max_cc=25`, `max_fn_lines=100`, `max_cycles=0`; no baseline, skipped tests, or continue-on-error was used.

## Behavioral coverage

1. First scan streams labeled synthetic activity, offers a usable quest before completion, exposes activity through the independent info action, and preserves a draft across minimization.
2. Actual front faces retain 5:7 geometry and width at least 260px at tested desktop/390/320 widths. Real CDP touch swipes, mouse drag/cancel, keyboard navigation, visible-circle clearance, mute persistence, and short-screen containment pass. External green Back restores the parent; cards expose no Back button or navigation landmark.
3. Every deliberate drop, open or closed, becomes the next resting anchor. Close/reopen preserves an open drop; automatic boundary fitting does not overwrite it. Open drag moves buddy/info without moving the deck. A real motion-enabled click is sampled over 25 animation frames: dock and sprite stay still when no boundary correction is needed. Acceptance gives +10 XP once, with no extra XP from navigation, snoozing, copying, cancel/retry, or source actions.
4. Prepared text preserves edits/history, copies exact literal content, opens a routed fixed Claude page without submitting, and exposes clipboard/popup failures honestly. Async job and source receipts cannot replace another quest's draft. Source-write approval remains separate.
5. My day filters preserve totals and expose observed/inferred/demo provenance, linked evidence, and explicitly synthetic source receipts rather than live telemetry.

## Findings resolved

Hosted Linux exposed a missing native click after fast swipes. The hidden-dialog wait, retained CDP session, and deferred DOM replacement did not resolve it. Bounded telemetry showed normal pointer/touch delivery but no synthesized Close click, matching [Chromium's phantom-fling defect](https://issues.chromium.org/issues/407890253). A scoped non-passive `touchmove` listener cancels defaults only after horizontal lock with one touch and a cancelable event. The same real swipe/Close/reopen test then passed on hosted Chromium. No synthetic event, arbitrary sleep, force-click, retry, or weakened assertion was added. Temporary telemetry is removed.

Earlier full runs exposed a fast buddy-drag capture bug and missing Back while a source receipt was pending. The canonical owner acquired pointer capture on pointerdown, retained the 8px threshold and up/cancel release, and made parent return independent of action-busy guards. History-aware return also covers activity. Async identity guards remain intact.

Subsequent user reports identified open-drag placement reverting and excessive click bounce. The canonical owner commits the drop to the resting anchor, removes decorative art animation/click blink/active scaling, and limits necessary boundary motion to one monotonic 180ms dock/info move. Expanded regressions cover the open-drag close/reopen roundtrip and real motion-enabled stability; reduced-motion-only checks no longer hide that behavior.

The test suite was updated for the user's superseding contract: large cards, no inside-card navigation, and the existing external green circle as Back. The drag test now targets a distinct position using the actual buddy handle. Clearance measures visible circles rather than their padded container. The first-scan test exercises the real info activity action instead of requiring an obsolete status button. Real touch and clipboard checks were not replaced with source-text assertions.

## Independent browser evidence

A separate delivery-owned browser inspected the final imported input-fix revision with motion enabled and recaptured the desktop, prefilled prompt, and 320×700 views; the narrow face measured 260×364 and external controls remained reachable. The earlier independent motion inspection measured a 320×448 desktop face and an open drop at `(698.5,112)` unchanged across close/reopen with zero art animations. Current automated regressions separately verify that retained behavior. My day's unchanged synthetic timeline and provenance were also inspected independently.

Imported-copy screenshots: [desktop](../images/imported-desktop.png), [prompt](../images/imported-prompt.png), [320px card](../images/imported-mobile.png), [320px controls after scrolling](../images/imported-mobile-controls.png).

The widget screenshots above depict the `d118f783…` input-fix revision. The later plan-text synchronization leaves those runtime assets unchanged. Its [architecture screenshot](../images/imported-architecture.png) was captured from the final imported revision: all four Mermaid diagrams rendered as SVG and explicitly describe the proposed Snowflake/Anthropic/WKWebView design, not a live native integration.

Source-owner composition evidence: [desktop](../images/companion-desktop.png), [bottom](../images/companion-bottom.png), [options](../images/companion-options.png), [prompt](../images/companion-prompt.png), [mobile](../images/companion-mobile.png), [mobile controls](../images/companion-mobile-controls.png), [390px](../images/companion-mobile-390.png). Those images were captured on `374b364a1ac5c864a90087da62a036e9b1c15ebc9e9ae792ee6866bc3e0c593f`, before behavior-only capture/navigation/placement fixes; exact later capture revisions are recorded in the snapshot. The [existing My day image](../images/personal-observability-desktop.png) is unchanged historical visual evidence, not a new final-hash capture.

Old small-card/inside-Back screenshots and earlier 61-check reports are superseded. No live Snowflake/model API, native permissions, real reminders, source writes, signing, or business outcome is claimed.

## Native-plan example validation

The proposed native DDL was extracted from the implementation plan and executed in an in-memory SQLite database. An ordinal-0 `steering` Other option, its prompt revision, and its acceptance inserted with valid foreign keys. Duplicate acceptance, a missing option FK, and a generated option mislabeled as steering were rejected. Three JSON examples and the one permission TOML example parsed successfully. These are documentation-contract checks only, not a Tauri build, WKWebView run, Snowflake connection, or Anthropic request.

## Cleanup and hosted status

Playwright closed its browser contexts/server. The independent delivery tab, diagnostic browser, and their uniquely named local servers were closed; other workers' and user tabs/processes were not touched. Hosted receipts are recorded in [CI.md](../CI.md). Repository visibility now reads public after an unexpected external change, preserved by this workstream. Main protection was subsequently configured and verified: exact required `PR gate`, strict checks, administrators included, and PRs with zero human approvals.
