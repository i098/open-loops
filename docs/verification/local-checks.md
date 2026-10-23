# Final repository-copy verification

This report covers the transformed `previews/` files, not an earlier `.lavish` revision. [snapshot.json](snapshot.json) records source, delivered-file, and screenshot SHA-256 values.

## Verified source identity

- Companion: `5dd268479d2797669ea451c003ad51fc6886d49ee01e56018d98c0be206dc7c9`.
- My day: `ed789a3d7d6eebe6a50758efd06beae2cc28b8f84aadabbb49ada8b284dac7ac`.
- Shared sprite: `2d2bf1d2bf100c94591d61b19f60c592295890c7fce82339b8a5f768ad5f84db`, copied unchanged and excluded from formatting.

HTML imports extract executable JS/CSS, rebase relative CSS URLs, retain execution order, and format the repository copy. They are not byte-identical HTML copies. Native Tauri/Rust/Swift/SQLite integration remains proposed, not implemented.

## Executed final gates

| Command                 | Actual result                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run format`        | Completed using pinned Prettier; original source files untouched                                       |
| `npm run format:check`  | Pass                                                                                                   |
| `npm run lint`          | ESLint, HTML validation, Stylelint, Markdownlint pass                                                  |
| `npm test`              | 13 policy/import tests pass; zero skipped                                                              |
| `npm run test:ui`       | All 9 Chromium tests pass in 12.2 seconds; zero skipped/retried                                        |
| `npm run check:sentrux` | Sentrux 0.5.7: all 3 strict rules pass; 3 application JS / 12 total first-party JS files; quality 6824 |
| `npm run bundle`        | Created `dist/open-loops-preview.tar.gz` with per-file SHA-256 manifest                                |

Local runtime: Node v26.12.1, npm 11.20.0. Hosted CI uses Node 24; local success is not a claim about hosted execution. Strict limits remain `max_cc=25`, `max_fn_lines=100`, `max_cycles=0`; no baseline, skipped tests, or continue-on-error was used.

## Behavioral coverage

1. First scan streams labeled synthetic activity, offers a usable quest before completion, exposes activity through the independent info action, and preserves a draft across minimization.
2. Actual front faces retain 5:7 geometry and width at least 260px at tested desktop/390/320 widths. Real CDP touch swipes, mouse drag/cancel, keyboard navigation, visible-circle clearance, mute persistence, and short-screen containment pass. External green Back restores the parent; cards expose no Back button or navigation landmark.
3. Buddy placement restores its resting anchor after close; open drag moves buddy/info without moving the deck. Info stays below the displayed buddy. Acceptance gives +10 XP once, with no extra XP from navigation, snoozing, copying, cancel/retry, or source actions.
4. Prepared text preserves edits/history, copies exact literal content, opens a routed fixed Claude page without submitting, and exposes clipboard/popup failures honestly. Async job and source receipts cannot replace another quest's draft. Source-write approval remains separate.
5. My day filters preserve totals and expose observed/inferred/demo provenance, linked evidence, and explicitly synthetic source receipts rather than live telemetry.

## Findings resolved

The first hosted Linux run found a test event-completion race: after a real Close tap returned, the next buddy tap resolved while the dialog was still open. The test now waits for the observable hidden dialog before reopening, without changing input type or adding sleeps, forced clicks, retries, or skips. This is a test synchronization fix, not a recovered product change; canonical source stays unchanged.

Earlier full runs exposed a fast buddy-drag capture bug and missing Back while a source receipt was pending. The canonical owner acquired pointer capture on pointerdown, retained the 8px threshold and up/cancel release, and made parent return independent of action-busy guards. History-aware return also covers activity. Async identity guards remain intact.

The test suite was updated for the user's superseding contract: large cards, no inside-card navigation, and the existing external green circle as Back. The drag test now targets a distinct position using the actual buddy handle. Clearance measures visible circles rather than their padded container. The first-scan test exercises the real info activity action instead of requiring an obsolete status button. Real touch and clipboard checks were not replaced with source-text assertions.

## Independent browser evidence

After the final import and gates, a separate delivery-owned browser tab loaded the transformed preview from its own local server. It measured a 320×448 desktop front face and 260×364 at 320×700, with no horizontal overflow. The short deck had a 392px viewport and 500px content height: scrolling reached the external Back, which restored the root card. The prepared prompt was prefilled and navigation stayed outside it. My day rendered its synthetic timeline and source provenance.

Imported-copy screenshots: [desktop](../images/imported-desktop.png), [prompt](../images/imported-prompt.png), [320px card](../images/imported-mobile.png), [320px controls after scrolling](../images/imported-mobile-controls.png).

Source-owner composition evidence: [desktop](../images/companion-desktop.png), [bottom](../images/companion-bottom.png), [options](../images/companion-options.png), [prompt](../images/companion-prompt.png), [mobile](../images/companion-mobile.png), [mobile controls](../images/companion-mobile-controls.png), [390px](../images/companion-mobile-390.png). Those images were captured on `374b364a1ac5c864a90087da62a036e9b1c15ebc9e9ae792ee6866bc3e0c593f`, before behavior-only capture/navigation fixes; the imported-copy evidence above covers the final hash. The [existing My day image](../images/personal-observability-desktop.png) is unchanged historical visual evidence, not a new final-hash capture.

Old small-card/inside-Back screenshots and earlier 61-check reports are superseded. No live Snowflake/model API, native permissions, real reminders, source writes, signing, or business outcome is claimed.

## Cleanup and hosted status

Playwright closed its browser contexts/server. The independent delivery tab, diagnostic browser, and their uniquely named local servers were closed; other workers' and user tabs/processes were not touched. Hosted PR, workflow, and artifact receipts are recorded in [CI.md](../CI.md). Repository visibility now reads public after an unexpected external change; this workstream preserved it. The earlier private-repository protection error is historical, not a current public-repository entitlement claim.
