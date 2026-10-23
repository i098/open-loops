# Open Loops — anchored companion and card platform

This direction supersedes the earlier pocket/header-rail anatomy; the obsolete diagram is not included. Final visual evidence must name the revision it depicts; older placement screenshots are not proof of this contract. Native behavior remains a proposal; the HTML is a single-DOM browser simulation.

## Placement and object identity

- One sprite DOM instance stays in the same buddy button. There is no name/XP/navigation rail above the card, no fake desktop, no shadow or gradient workaround, and no forced recenter on open or close.
- The user drags the 128px buddy hit area. Movement beyond 8px is placement, not activation. Each deliberate drop commits the chosen resting x/y in session memory, whether open or closed. Opening, closing, and automatic viewport fitting do not overwrite it. No reload/storage persistence is implied.
- Info is an independent card always below the displayed buddy. The deck has separate bounds, sizing, and animations; it is not an info/deck wrapper. Near the bottom edge, top-to-bottom order is **deck including circular actions, buddy, info**. Lift the buddy only enough to fit info; place the deck independently above it.
- Close restores the latest user-dropped resting anchor. Dragging an open buddy moves info, not the deck, and its drop becomes the new anchor for subsequent close/reopen. No decorative click hop, bounce, blink-pose change, or hover travel. Only a necessary boundary correction may move the actual dock in one short monotonic path; reduced motion makes it immediate.
- Proposed Tauri windows mirror these three independent surfaces, with a normal optional My day window and per-window capabilities. Browser layout is not proof of native focus, click-through, or multi-display behavior.
- Review-only My day / Design & architecture links sit at the bottom corner, outside the widget. They are not a topbar or part of the quest decision.

## Card and controls

- The draggable quest face remains exactly 5:7 width/height: normally 320×448px desktop, minimum 260×364px where width permits. Narrow width is `min(260px, viewport width − 24px)`. No height-based shrinking. A short screen scrolls the deck-owned viewport to reach the full card and external controls. Preserve same-ratio backing outlines only for actually available extra cards.
- A flat white card, thin perimeter and no shadows. No giant containing shell around the quest and its controls. Long text is scrollable without changing the card ratio.
- Root swipe actions are a single non-wrapping row below the card, within the deck's bounds: white circles, red X for Later, green check for Next step. Desktop 72px, below 360px viewport 64px, gap 32px. Essential labels and safety text are at least 16px; use scrollable content rather than shrinking them. No heart, boost or superlike.
- Secondary views retain plain choices and an explicit acceptance button. No Back button, navigation bar, header cap, or reserved navigation padding is inside any card. The existing green circle below the card is the only Back button on child views; root remains Next step. Close stays in independent info. Back preserves draft and exact parent; Close only hides. Escape goes back one face, then closes.
- Info owns Preview, mute, Close, count/age, status, scan progress, and the bottom XP rail. It stays in place during deck navigation. XP derives from unique accepted quest IDs: +10 once on explicit acceptance, Pip 0–19, Scout 20–29, Guide 30+. A swipe, snooze or pre-accept cancel earns none. XP is not completed business work.

## Setup and progress

- First run: Finding your first quests; explain that first sync takes longer and cards appear as they are found. Browser actions: Start setup preview, or Skip to ready preview.
- Show an indeterminate progress bar only while the simulated scan is running. Accessible name: First scan in progress; no fabricated numeric value. Label the event stream as simulated and disconnected from real work data.
- The scripted first quest arrives at 2s before the 6s sample completion. Each ready card already contains its options, prepared prompts, scope, and evidence. Later arrivals append without replacing an active card, editor or approval. Closing/reopening preserves the running demo job state.
- Keep processing-zero, complete-empty, recoverable failure and partial failure distinct. Processing is never all-clear. Only first availability and terminal outcome announce politely; no event sounds or automatic opening.

## Safety and input

- Root left opens three duration choices; root right opens two/three precomputed task choices. Child right or Back restores the exact parent; child left opens snooze for the same quest, not nested snooze history. Both swipes and accessible buttons remain available. Horizontal lock preserves vertical scrolling; capture ownership changes must not cancel the new drag.
- Other opens the existing prepared prompt, prefilled with current quest/option context, inside the same card. Preserve edits and navigation history; save returns to review. No fresh model request, blank chat composer, or custom-date workflow.
- Starting a demo/API read/draft job requires separate explicit acceptance. Manual Copy/Open after save/review is itself an explicit handoff, needs no demo acceptance, and awards no XP: copy the reviewed text, open only a fixed Claude/Codex page, and require manual paste. Never autosubmit or claim a run/completion. External-tool permissions are outside the proposed app sandbox; provider jobs and source receipts in this browser are simulated.
- A real source send/close needs separate exact-target approval with current permission/state checks in the proposed implementation.
- Optional synthesized sound begins only after a user gesture. Mute stays accessible in info. Short tap/drop/accept/evolution cues only; idle and errors are silent. Reduced motion does not change sound preference. At five minutes of OS idle, the proposed app may suggest a quest quietly, never auto-open or dispatch.

## Current proof boundary

Use actual new screenshots and behavior tests, not superseded header/card drawings. Keep deck and info within viewport bounds without overwriting the buddy's resting anchor. Check the independent geometry, minimal buddy lift, and drag behavior above. Source architecture is separately documented in the Tauri-only Mermaid plan; no native integration is implemented here.

Large-card composition evidence: [desktop](images/companion-desktop.png), [bottom](images/companion-bottom.png), [options](images/companion-options.png), [prompt](images/companion-prompt.png), and [mobile](images/companion-mobile.png). Earlier small-card/inside-Back images are superseded. [Verification](verification/local-checks.md) distinguishes source-owner captures from the final imported-copy browser evidence and executed checks.
