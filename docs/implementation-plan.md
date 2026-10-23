# Open Loops — implementation reference

**Status:** detailed reference for the proposed native product. Browser previews and CI tooling are delivered separately; native runtime, live integrations, and app scaffold remain unimplemented. Current verification status is in [CI.md](CI.md), not inferred from this plan.

[README](../README.md) records initialization and preview instructions. This document preserves full implementation decisions; [architecture.md](architecture.md) owns the Mermaid diagrams and [ui-design.md](ui-design.md) owns current visual geometry and copy.

## 1. Outcome, scope, and non-goals

### Product outcome

Make an office open loop easy to recognize, decide, and act on without composing a chat request from scratch. The selected native build is **Tauri v2/macOS WKWebView + Rust + SQLite + Snowflake SQL API + Anthropic Claude Messages API**. Read authorized Snowflake evidence, use Claude to generate validated complete card packs and options, and run bounded Claude read/draft jobs only after explicit acceptance. Manual Copy/Open to Claude or Codex is an optional export, not the backend. Source writes remain separately authorized and outside this first native slice.

The narrow first workflow is a stale request such as `REQ-184`: inspect related request evidence, propose a duplicate-closure recommendation or a question for Maya, and prepare the chosen result. A recommendation does not close a request. A draft does not send a message.

### Settled implementation decisions

| Area             | Decision                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop runtime  | Tauri v2, macOS, local HTML/CSS/JS renderer in the system WebView; **no Electron**                                                      |
| Privileged owner | Rust owns commands, state, background jobs, network calls, credentials access, persistence, and approval enforcement                    |
| Optional context | Bundled/signed Swift AXObserver helper; optional ScreenCaptureKit still capture of a user-selected allowed window                       |
| Durable memory   | One local SQLite database, FTS for source-cited summaries, deterministic job/quest/snooze/acceptance records; no vector DB              |
| Product surfaces | Separate buddy, info, and deck windows; optional normal My day window; one Rust-owned store and least-privilege per-window capabilities |

### Deliberately excluded

No chat-first interface, fake desktop scene, autonomous sending/closing, broad desktop surveillance, keystroke logging, raw-video upload, multi-provider orchestration framework, separate queue/backend/event service, speculative plugin architecture, or placeholder native scaffold. Implement the selected Snowflake/Anthropic path only. No auto-opening the companion or auto-accepting quests.

## 2. Companion, cards, and user decisions

### Physical and navigation contract

- The independent deck contains an unmistakable **5:7 physical swipe card**, no shadows, and truthful backing-card edges. Desktop size is normally 320×448px, at least 260×364px when width allows. Narrow width is `min(260px, viewport width − 24px)`, preserving 5:7. Do not shrink by available height; use deck-owned scrolling on short screens. Root actions are circular red-X/green-check controls with accessible Later/Next step names; backings reflect real remaining cards and are inert.
- Remove the heavy header. The buddy, info card, and deck have separate geometry. Info is always below the displayed buddy; the deck owns its own position, sizing, and animations. Near the bottom edge, top-to-bottom order is deck including circular actions, buddy, info. Lift the buddy only enough to fit info below it, not the whole deck.
- Retain the latest user-dropped resting anchor in browser-session memory. A deliberate open or closed drag commits the new anchor; automatic boundary fitting never does. Close/reopen preserves that placement. Open drag moves info but not the deck. No decorative click bounce/hop or competing sprite-position animation; only a necessary boundary correction may move the dock monotonically. Do not duplicate the sprite or claim browser placement proves native windows.
- **No navigation controls or reserved navigation padding inside any card.** The existing green circular control outside the card becomes Back on child views; there is no extra Back button or header cap. It pops one view and preserves quest, draft, and job. Close stays in info and hides all companion surfaces, not cancels. Escape performs Back when available, otherwise Close. Neither action approves work.
- Put the slim acceptance-XP bar at the info card's bottom. Info owns Preview, mute, Close, count/age, progress, and status; it does not move during deck navigation. Keep exact XP text accessible. First-scan progress is indeterminate: no fake percentage, ETA, or numeric `aria-valuenow`.
- At 390/320px, retain the full-size 5:7 card and scroll the deck's own viewport when card plus controls cannot fit above the buddy. Scroll long body/brief content separately. Keep essential text at least 16px, usable type at 200% zoom, selectable evidence, 44px targets, and no horizontal overflow. Never reduce card/font size to accommodate buddy/info height.
- Review architecture, fixture controls, and reset live outside the product surface. Browser preview has a persistent `Preview` marker and accurate consequential receipts. Native transparency/click-through placement requires separate packaged-app verification.

The precise color/type/spacing values, optical sprite positions, copy, and gesture physics are in [ui-design.md](ui-design.md). The palette uses ceramic shell `#F0F2EC`, card `#FFFEFA`, ink `#27332D`, and moss `#355F50`; use native system type, rem-based text/spacing, and plain numbered choice rows rather than decorative tiles.

### Decision flow

See the canonical Mermaid diagrams in [architecture.md](architecture.md).

Root right opens stored action options. A child right swipe or Back restores its exact parent; child left opens the same quest's snooze choices without nesting repeated snooze history. Other opens the prefilled prepared-prompt editor in the same card, preserves edits/history, and returns to review. Navigation performs no network request, acceptance, XP change, or job dispatch.

### Quest fixtures and scoped options

| Quest       | Cited situation                                                     | Numbered next actions                                                                                                          |
| ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `REQ-184`   | Laptop arrived; request still open; possible duplicate of `REQ-221` | 1. Check the duplicate evidence. 2. Draft a closure recommendation, close nothing. 3. Draft a question for Maya, send nothing. |
| `APR-42`    | Launch brief needs the person's review                              | 1. Summarize approval context. 2. Draft a revision request. No approval on the person's behalf.                                |
| `Thread 17` | Leo is waiting for a timeline; saved thread has no later reply      | 1. Draft a reply without unverified dates. 2. Check the saved thread for the promise and missing context.                      |

Left presents `In 1 hour`, `Tomorrow morning`, and `Next week`, including the actual return date/time and timezone in the native product. Browser fixture timestamps are explicitly fixed sample times, not the viewer's current clock. A fixture snooze says no real reminder was scheduled. Undo affects the snooze, not acceptance or source state.

Before acceptance, show the chosen destination, read scope, intended output, hard restrictions, and full editable outgoing brief. Editing must not expand hard limits. Changing task, scope, destination, or payload invalidates prior confirmation. Label simulated jobs as demo; explicit Copy/Open may use the real clipboard and a fixed tool page, but never sends the prompt to a model or executes it.

### Input, sound, and idle behavior

- Use Pointer Events with native vertical scrolling. Ignore controls/text-selection regions; lock horizontal intent only after a deliberate horizontal drag; cancel or lost capture returns the card. A committed swipe opens a chooser only. Suppress synthetic click and duplicate gesture handling.
- Keep explicit Later/Next step buttons and keyboard equivalents. Arrow shortcuts act only on the focused quest region, never while editing. Restore focus on Back/Close; announce important state changes once, not every activity event.
- Reduced motion removes travel/rotation/animated progress. No perpetual bobbing, flashing, or forced timed dismissal of essential content.
- Optional synthesized sound is gesture-unlocked, short, quiet, and independently mutable. Mute is always discoverable; unavailable audio must not block work. No sounds for idle, hover, event-stream rows, or background discovery.
- At approximately **300 seconds of OS idle**, refresh eligible evidence and suggest a due quest quietly through the buddy. No automatic popup, focus movement, acceptance, source action, or noisy notification. Pause/disable this behavior by preference. Browser timer simulation is not proof of native OS idle detection.

### Acceptance, XP, and evolution

**+10 XP on explicit acceptance, exactly once per quest ID, not on completion.** Zero XP for swipes, task selection, snooze, evidence inspection, setup, scan progress/completion, or source writes. Failure/cancellation after acceptance keeps XP; cancellation before acceptance awards none. Retrying or accepting the same quest again cannot farm XP.

Pip: 0–19 XP. Scout: 20–29 XP. Guide: 30+ XP. Derive stage and progress from authoritative unique acceptance records; no independent contradictory level counter. Show threshold celebrations once, retain accessible text, respect mute/reduced motion, and stop the progress rail at Guide rather than implying another level. XP is an engagement mechanic, **not business proof**.

## 3. First installation and first scan

### Native onboarding tree — proposed, not implemented

The same decision deck hosts setup; info remains an independent status surface below the buddy, not a common setup popover or separate wizard application. Source authorization comes first. Optional Accessibility access and optional screen capture are independent, skippable choices. Granting either is not permission to upload context or send/write anything.

See the canonical Mermaid diagrams in [architecture.md](architecture.md).

### Browser demonstration — deliberately different

Start with `Start setup preview` and `Skip to ready preview`. Skip reveals the three fixture cards at zero XP, without inventing a completed scan. Do not collect actual credentials or pretend browser controls grant macOS permissions.

`Start setup preview` shows **Simulated activity · no workspace connected**. Illustrative deterministic schedule: 0s sample scan started; 1s sample `REQ-184` reviewed; 2s first sample quest ready; 3.5s sample `APR-42` reviewed; 5s sample `Thread 17` reviewed; 6s sample scan complete. These are script timings, not live pipeline events, product performance measurements, or promises.

The first card becomes usable at the 2s sample event; later events continue behind it. Show an accessible indeterminate progress bar during the scan, clearly labeled as scripted in the browser. Failure/success fixtures remain outside the main companion. Current copied-source evidence is recorded separately from the proposed native runtime.

### Runtime states and activity truth

| State                       | What the person sees                                  | Required behavior                                                                |
| --------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Processing, zero cards      | Looking for your first quest; latest actual events    | Keep working hides UI without stopping job. Never say no quests found yet.       |
| Processing, cards available | First quest ready; `N ready · Scan running`           | Review immediately; append behind active card; do not move focus or reset draft. |
| Completed, zero cards       | No quests found in successfully checked sources       | Only after all selected sources completed successfully.                          |
| Partial                     | `N quests ready. Scan incomplete.` plus source/reason | Preserve cards and checkpoint; retry failed source without duplication.          |
| Failed, zero cards          | The scan could not finish; observed reason            | Fix permission/auth or retry; never claim workspace is clear.                    |

Use source connection, batch loaded, analyzing batch, `quest_ready`, completed, and failed events only when those transitions occur. `quest_ready` means the entire validated card pack is usable, including its precomputed options and prepared prompts. Show timestamps, source names, and observed cumulative counts. No fabricated percentages, stages, ETA, or rolling counter animation. Waiting is `Waiting for [source]`, not an invented work event.

Show the latest three activity rows in the companion with access to longer history. Announce the first available card and final result politely; do not flood assistive technology. The collapsed buddy has a static processing marker and/or ready count, never auto-opens, and restores current scan/card state on reopen. If every currently available card is reviewed while scanning continues, show `Looking for more quests`, not a successful-empty result. If a job remains running, an empty deck does not mean all work is done.

## 4. Target architecture and trust boundaries

All paths in this section are **proposed future implementation files**, not files already scaffolded in this repository.

See the canonical Mermaid diagrams in [architecture.md](architecture.md).

Use separate bounded buddy, info, and deck windows plus an optional normal My day window. Rust owns resting anchor, displayed pose, and independent deck bounds; renderers do not maintain competing stores. Info always follows below the displayed buddy. The browser's single DOM only simulates this topology; native focus, click-through, display coordinates, and window placement need packaged-app validation.

### Privileged boundary

Tauri custom application commands are **not restricted merely by registering them**. Declare their permissions through `src-tauri/build.rs` with `AppManifest::commands`, include only necessary command permissions in per-window capability files, and validate every privileged request again in Rust. Verify this wiring against the pinned Tauri v2 API/version during implementation. UI affordances and disabled buttons are not authorization.

Only bundled local assets may invoke these capabilities. Use a restrictive CSP and explicit external-navigation policy; render source/model content as untrusted text, not executable HTML. Do not grant broad filesystem, shell, HTTP, SQL, or opener capability to the renderer. Avoid remote scripts/fonts in the packaged production renderer even if the browser prototype uses review-time CDNs.

Rust checks window identity/origin, authorized actor, object ownership, allowed operation, field lengths/types/enums, payload size, selected source scope, permission state, and current approval. Reject unknown commands and unexpected fields. The renderer never supplies arbitrary SQL, shell commands, executable paths, provider URLs, Keychain queries, or unrestricted filesystem paths.

### Proposed command surface

The [exact native IPC contract](#exact-native-ipc-contract) below is authoritative. Optional future capture/source-write commands are not registered in the first Snowflake/Claude read-draft slice. Give each window only its listed commands; validate argument shape, actor scope and approval again in Rust. Never log tokens or raw sensitive context.

### Exact native IPC contract

This contract is the single implementation target, not implemented API surface. Use Serde DTOs with `deny_unknown_fields`. IDs are UUID strings; revisions and sequence cursors are nonnegative integers; timestamps are RFC 3339 UTC. Reject an invocation above 64 KiB, text above 8192 UTF-8 bytes, unknown enum values, missing identities, or stale revisions. Resolve actor identity and hard permissions in Rust, never from a renderer-supplied `actor_id`.

`prompt_sha256` hashes canonical JSON containing quest/option/revision, text, immutable hard scope, approved model/destination and source revision—not text alone. Store those scope fields with the immutable prompt revision. Reject request-ID reuse with different payloads. `acceptance_id` is the quest UUID because the schema permits exactly one acceptance per quest. An info-window `set_companion_open` invocation may only set `open:false`.

| Command                                 | Input → output                                                                                                                    | Permitted window                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `get_snapshot`                          | `{}` → `{schema_version:1, last_seq, connection_status, quests, active_jobs, placement, xp}`                                      | buddy, info, deck, day; redact fields by window    |
| `get_events_since`                      | `{after_seq, limit:1..500}` → `{events, last_seq, has_more, reset_required}`                                                      | all; same redaction                                |
| `set_companion_open`                    | `{open:boolean}` → `{open, placement}`                                                                                            | buddy, info, deck                                  |
| `set_buddy_position`                    | `{monitor_id:string, x:number, y:number, phase:enum(drag,drop)}` in work-area logical points → `{resting, displayed, info, deck}` | buddy only; conversion/clamping in Rust            |
| `set_muted`                             | `{muted:boolean}` → `{muted}`                                                                                                     | info only                                          |
| `save_connection_settings`              | `{expected_rev, settings}` → `{settings_rev, status}`; settings schema below has no secrets                                       | deck only, explicit setup/review action            |
| `connect_snowflake`, `test_connections` | `{request_id}` → `{job_id}`; native OAuth/system browser or explicit scoped probes                                                | deck only                                          |
| `start_bootstrap`, `retry_source`       | `{request_id}` or `{job_id, request_id}` → `{job_id, reused:boolean}`                                                             | deck only                                          |
| `prepare_brief`                         | `{quest_id, option_id, expected_rev, text}` → `{prompt_rev, prompt_sha256, hard_scope}`                                           | deck only                                          |
| `accept_quest`                          | `{quest_id, option_id, prompt_rev, prompt_sha256, request_id}` → `{acceptance_id, job_id, xp, reused}`                            | deck only; atomic acceptance/job transaction       |
| `cancel_job`                            | `{job_id, request_id}` → `{job_id, status}`                                                                                       | deck only; may cancel only the current actor's job |
| `snooze_quest`                          | `{quest_id, preset:enum(hour,tomorrow,week), request_id}` → `{until}`                                                             | deck only; Rust resolves UTC time                  |
| `copy_prompt`, `open_tool`              | `{quest_id, option_id, prompt_rev}` plus `tool:enum(claude,codex)` for Open → truthful clipboard/open receipt                     | deck only; optional export, no job/XP              |
| `get_activity`, `search_memory`         | `{after_seq, limit}` or `{query, limit:1..50}` → bounded redacted records                                                         | day and deck; never privileged capture/write       |

Use a single durable event name, `open-loops:event`, targeted only to authorized windows. Payload:

```json
{
  "schema_version": 1,
  "event_id": "UUID",
  "seq": 42,
  "at": "2026-10-23T10:00:00Z",
  "kind": "job.progress",
  "job_id": "UUID",
  "quest_id": null,
  "payload": { "stage": "snowflake.partition", "records_observed": 100 }
}
```

Allowed kinds: `connection.changed`, `scan.started`, `scan.progress`, `quest.ready`, `quest.updated`, `job.accepted`, `job.progress`, `job.result`, `job.failed`, `job.canceled`, `quest.snoozed`, `placement.changed`. Each kind has a bounded typed payload; never forward arbitrary provider JSON, credentials, SQL, or raw captures. Progress counters represent observed work, not estimated completion percentages.

In `build.rs`, register these custom commands with `tauri_build::AppManifest::new().commands(...)`. Define four application permission sets in `permissions/*.toml`, then bind them to exact window labels in `capabilities/{buddy,info,deck,day}.json`; no wildcard windows and no blanket shell/filesystem/HTTP plugin permission. Example app permission:

```toml
[[permission]]
identifier = "read-state"
description = "Read redacted state and replay events."
commands.allow = ["get_snapshot", "get_events_since"]
```

`buddy` gets read-state plus placement/open; `info` gets read-state plus mute/close; `deck` gets the typed workflow/settings/export commands; `day` gets read-state/activity/search only. Rust rechecks caller label and actor on every command even after Tauri ACL approval. Connection settings and OAuth callbacks never accept model-controlled URLs. Source-write commands are not registered in this first read/draft build.

### Native placement coordinates

Use one Rust-owned representation: `{monitor_id, x, y}` where `x/y` are **logical points from the top-left of that monitor's usable work area**, increasing right/down. Window sizes and info/deck gaps are logical points too. Save the monitor's stable display UUID and resting tuple in nonsecret settings only on deliberate drop. Automatic edge fitting, monitor changes and scale changes update the displayed pose, never the saved tuple.

`commands.rs` owns monitor inventory, usable work-area bounds (macOS `NSScreen.visibleFrame`), scale factors and coordinate conversion. Convert macOS bottom-left rectangles to top-left once at this boundary. For each axis, Tauri's physical position is `monitor_physical_origin + round(scale_factor * (work_area_inset_points + local_points))`; the inverse subtracts the physical origin, divides by that monitor's scale, then subtracts its work-area inset. Never scale the global origin or treat CSS pixels/`devicePixelRatio` as authoritative desktop coordinates.

The buddy's native drag/move integration reads the actual window position; renderer drag intents are validated against that native position and known monitor IDs. Rust returns logical placement in snapshots/events so renderers do not maintain another anchor. Native drag over a monitor boundary resolves the destination monitor before conversion. The deck keeps its own anchor; only info follows buddy motion.

On startup or monitor removal, if the saved monitor is unavailable, display on the primary work area at a clamped temporary pose without destroying the saved original tuple. A deliberate new drop commits the new monitor/position. Keep the full buddy hit area accessible; fit info below it and independently fit/scroll the deck. If automatic fitting is needed, use only the already specified monotonic dock motion.

Acceptance must cover 1× and 2× monitors, a mixed-scale cross-monitor drag, negative desktop origins, changing Dock/menu-bar work areas, unplug/replug, and an offscreen saved anchor. Assert point roundtrips within one physical pixel, no cumulative scale drift, same-session open-drop close/reopen retention, and restoration/fallback without an automatic saved-anchor write.

### Async bootstrap, snapshots, and recovery

See the canonical Mermaid diagrams in [architecture.md](architecture.md).

Run I/O through Rust's async runtime and isolate blocking SQLite/native work from the UI thread. Keep one simple job owner, not a new queue service. Every durable event carries `event_id`, `job_id`, monotonic persisted sequence, timestamp, source where applicable, kind, and bounded truthful payload. Persist state/checkpoint/event in one transaction **before emitting**. Query the journal rather than relying on transient Tauri event delivery as durable truth.

Before a quest becomes ready, generate a complete card pack: quest data, 2–3 stable option IDs/labels, prepared briefs, hard scopes, evidence refs, Other steering affordance, and preloaded snooze policies. Validate the pack and atomically persist it with checkpoint/event before emitting `quest_ready`. If its options are incomplete, that card is not ready; other complete cards still stream independently. Navigation renders only these stored values, never a model/network call.

Other always opens the prepared prompt, prefilled with current quest/option context. It edits that prompt within visible read/draft limits, preserves it through parent navigation, and returns to review; it is not a new workflow or custom-date form. Keep exactly three preset snooze policies with dates resolved at selection. Copy/Open handoff remains explicit and separate from acceptance or execution.

Register listeners before requesting a snapshot or starting work. Buffer incoming events while reconciling; discard sequences already included in the snapshot, apply later events in order, and request replay/snapshot on gaps. Persist source cursor, completed batches, failures, stable quest identity, and job status. Reopen uses the same job, not an implicit new scan. Restart resumes a safe checkpoint with idempotent upserts; no work runs while the app process is stopped. A fresh scan versus retry must be explicit, with deterministic quest identity across repeated evidence.

Async job completion and source-action responses carry their originating quest, option/prompt revision, job ID, and action ID. Persist updates against those identities even if the person navigated to another card; never use the currently displayed quest as the callback target. Handoff alone is not a job completion, and a source-action receipt cannot overwrite an unrelated job.

Keep bounded retry/backoff and actionable error reasons. Cancellation stops future work where possible but does not roll back a completed external request. After a network timeout with unknown outcome, reconcile; never blindly repeat a possibly executed write.

## 5. Local memory, credentials, and context

### Data ownership

| Data                                                 | Owner / persistence                                                     | Invariants                                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Quests, evidence refs, snoozes, acceptance           | Rust / SQLite                                                           | Stable quest ID tied to source identity; explicit source and observed time; one unique acceptance per quest. Snooze does not mean closed. |
| Jobs, checkpoints, events, approvals, source actions | Rust / SQLite                                                           | Transactional progress and sequence; approvals bind exact revisions/hashes; external outcome may remain unknown.                          |
| Useful summaries and activity                        | Rust / SQLite + FTS                                                     | Cited evidence, observed/inferred label, origin, timestamp, retention/expiry. Do not treat a summary as fresher than its source.          |
| Access credentials                                   | Rust/native / macOS Keychain                                            | No secrets in SQLite, HTML, browser storage, repository, events, or logs. Keychain does not encrypt SQLite automatically.                 |
| Working context and raw stills                       | Rust/native / short-lived RAM or necessary tightly bounded temp storage | Discard by default after use/cancel/expiry; no retained screenshot history without explicit choice.                                       |

The initial migration below is authoritative for the read/draft core. It stores quests/options, immutable prompt revisions, unique acceptances, jobs/checkpoints/events, snoozes and cited memory/FTS. Approval/source-action tables are added only with a separately authorized write connector; they are not required for the first live Snowflake/Claude build.

Acceptance records the unique quest and approved prompt revision atomically with its Anthropic job. Copy/Open export creates neither acceptance nor job. Duplicate acceptance cannot increment XP or dispatch equivalent work twice; an explicit retry links the same acceptance and earns no further XP. Local uniqueness is not an exactly-once network guarantee.

Use FTS with IDs, person/source filters, and recency for retrieval. Retain short cited summaries, not every raw AX event. Superseded or stale memory can suggest a query but cannot authorize a write. Retention duration, delete/export behavior, local file permissions, and any at-rest encryption requirement are release decisions; do not assume Keychain covers them.

### Initial SQLite migration and transaction boundaries

Implement the following in `src-tauri/src/store.rs` with `rusqlite`'s bundled SQLite, bound parameters, and a versioned migration. `TEXT` JSON columns must pass `json_valid` before commit. Use one short-lived writer transaction; never hold it while awaiting HTTP. Proposed DDL:

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE settings (
  singleton INTEGER PRIMARY KEY CHECK(singleton = 1),
  revision INTEGER NOT NULL,
  config_json TEXT NOT NULL CHECK(json_valid(config_json))
);
CREATE TABLE command_receipts (
  request_id TEXT PRIMARY KEY, command TEXT NOT NULL, payload_sha256 TEXT NOT NULL,
  response_json TEXT NOT NULL CHECK(json_valid(response_json)), created_at TEXT NOT NULL
);
CREATE TABLE evidence (
  id TEXT PRIMARY KEY, source_key TEXT NOT NULL, actor TEXT NOT NULL,
  revision TEXT NOT NULL, observed_at TEXT NOT NULL,
  excerpt TEXT NOT NULL, content_sha256 TEXT NOT NULL
);
CREATE TABLE quests (
  id TEXT PRIMARY KEY, source_key TEXT NOT NULL UNIQUE,
  source_revision TEXT NOT NULL, source_created_at TEXT, version INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL CHECK(state IN ('ready','snoozed','handled','stale')),
  card_json TEXT NOT NULL CHECK(json_valid(card_json)),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE quest_options (
  quest_id TEXT NOT NULL REFERENCES quests(id), option_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK(ordinal BETWEEN 0 AND 3),
  kind TEXT NOT NULL CHECK(kind IN ('steering','summary','question_draft','closure_recommendation')),
  label TEXT NOT NULL, PRIMARY KEY(quest_id, option_id),
  UNIQUE(quest_id, ordinal),
  CHECK((ordinal = 0 AND kind = 'steering') OR (ordinal BETWEEN 1 AND 3 AND kind <> 'steering'))
);
CREATE TABLE prompt_revisions (
  quest_id TEXT NOT NULL, option_id TEXT NOT NULL, revision INTEGER NOT NULL,
  body TEXT NOT NULL, sha256 TEXT NOT NULL,
  hard_scope_json TEXT NOT NULL CHECK(json_valid(hard_scope_json)),
  PRIMARY KEY(quest_id, option_id, revision),
  FOREIGN KEY(quest_id, option_id) REFERENCES quest_options(quest_id, option_id)
);
CREATE TABLE acceptances (
  quest_id TEXT PRIMARY KEY, option_id TEXT NOT NULL, prompt_revision INTEGER NOT NULL,
  prompt_sha256 TEXT NOT NULL, request_id TEXT NOT NULL UNIQUE, accepted_at TEXT NOT NULL,
  FOREIGN KEY(quest_id, option_id, prompt_revision)
    REFERENCES prompt_revisions(quest_id, option_id, revision)
);
CREATE TABLE jobs (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK(kind IN ('bootstrap','draft','connection_test')),
  quest_id TEXT REFERENCES quests(id), option_id TEXT, prompt_revision INTEGER,
  attempt INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK(status IN ('queued','running','ready','partial','failed','canceled','interrupted')),
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  result_json TEXT CHECK(result_json IS NULL OR json_valid(result_json)),
  usage_json TEXT CHECK(usage_json IS NULL OR json_valid(usage_json)), error_code TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY(quest_id, option_id, prompt_revision)
    REFERENCES prompt_revisions(quest_id, option_id, revision)
);
CREATE UNIQUE INDEX one_active_draft ON jobs(quest_id)
  WHERE kind = 'draft' AND status IN ('queued','running');
CREATE TABLE job_checkpoints (
  job_id TEXT PRIMARY KEY REFERENCES jobs(id),
  cursor_json TEXT NOT NULL CHECK(json_valid(cursor_json)),
  statement_handle TEXT, statement_request_id TEXT, updated_at TEXT NOT NULL
);
CREATE TABLE job_events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL UNIQUE,
  job_id TEXT REFERENCES jobs(id), quest_id TEXT REFERENCES quests(id),
  kind TEXT NOT NULL, at TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json))
);
CREATE TABLE snoozes (
  quest_id TEXT PRIMARY KEY REFERENCES quests(id), until_utc TEXT NOT NULL
);
CREATE TABLE memory_summaries (
  id TEXT PRIMARY KEY, summary TEXT NOT NULL,
  provenance TEXT NOT NULL CHECK(provenance IN ('observed','inferred','demo')),
  evidence_ids_json TEXT NOT NULL CHECK(json_valid(evidence_ids_json)),
  created_at TEXT NOT NULL, expires_at TEXT
);
CREATE VIRTUAL TABLE memory_search USING fts5(memory_id UNINDEXED, summary);
```

Transaction rules, implemented once in `store.rs`:

1. **Bootstrap page:** persist validated evidence, each complete quest/options/prompt pack, the processed page cursor, and `quest.ready`/progress events atomically. Never advance the durable cursor past unpersisted records. Replays upsert by `source_key` and source revision, not display index.
2. **Accept:** `BEGIN IMMEDIATE`; check immutable prompt revision/hash and source eligibility; insert acceptance if absent, queue one draft job, append event, commit. Existing acceptance returns existing XP/job or requires explicit retry after a terminal failure. XP is `10 * COUNT(acceptances)`, never another writable counter.
3. **Finish/cancel:** update the originating job ID and append its event in one transaction. A cancellation makes later completions ineligible to publish a successful result. Preserve an old-revision result under its job identity; never overwrite the currently edited prompt or another quest.
4. **Memory:** update summary and its FTS row in the same transaction; delete both on expiry/user deletion. Store cited summaries, not complete model conversations or raw source/capture history.
5. **Restart:** mark interrupted HTTP jobs recoverable, load checkpoints, and reconcile Snowflake statement handles before retrying. Subscribe before snapshot; buffer events, discard `seq <= last_seq`, replay gaps. If the cursor predates retention, return `reset_required` and a fresh snapshot rather than inventing missing events.

### Optional native context

`native/ContextObserver.swift` uses AXObserver/AXUIElement against an explicitly allowed app. Register for supported change/focus notifications, debounce, compute bounded deltas, and report structured records with timestamps and provenance. AX coverage is incomplete: unsupported web/canvas controls and inaccessible content stay **unknown**, not guessed. Do not log keystrokes or scrape every app. Idle uses an OS idle signal, not saved keyboard input.

Rust launches only the packaged helper; the renderer cannot choose an executable or shell arguments. Validate helper JSON-line messages for length, shape, allowlisted app identity, and expected fields; restart/permission denial must fail safely. One helper is sufficient; no native helper farm.

A screenshot requires a user-selected window, separate screen permission, a one-shot ScreenCaptureKit still, local preview/masking, and approval of the exact bytes and destination before upload. Approval of Accessibility access is not screen permission; screen permission is not upload permission. If masking changes the image or destination changes, reapprove. Clear revoked/expired captures. No continuous recording or silent raw-video upload.

## 6. Anthropic execution, optional export, and source-write safety

The native core is Snowflake evidence → validated Anthropic card packs → explicit acceptance → an Anthropic read/draft job. Optional browser Copy writes the exact reviewed prompt; a denied clipboard request retains selectable text and reports failure honestly. Open targets a fixed allowlisted Claude/Codex page without a prompt-bearing URL. Manual paste is required; this export neither executes a job nor needs an app-held model credential.

Future Tauri adapters may launch approved installed tools using documented support, fixed executable resolution, validated argument arrays, and point-of-action approval. Never accept arbitrary shell/argv/URL from the renderer. Record handoff separately from a running job. External tools own their permissions; the Open Loops app sandbox does not control them, and prompt restrictions do not guarantee safe execution or completion.

The native API runner is **Anthropic Claude**, not a provider-choice framework. Rust owns its separate approved API credential, fixed host, exact model ID, budgets, cancellation, tool allowlist, and output validation. Send only approved evidence/context. Record evidence IDs and optional capture hash for provenance without retaining raw screenshots. Codex login and Claude Code subscription tokens are not Anthropic Messages API credentials.

The model may request only bounded read tools and return drafts/findings. Rust constructs parameterized Snowflake reads against approved views and enforces actor/row scope; model-generated SQL, arbitrary URLs, shell, and direct source writes are forbidden. Treat source records, AX text, screenshots, and model text as data that may contain prompt injection. Their embedded instructions cannot expand granted scope.

### Snowflake SQL API: fixed read contract

`snowflake.rs` uses a Rust `reqwest` client with HTTPS-only fixed account origin, 5s connect timeout, 30s request timeout, and no cross-origin redirects. Store OAuth tokens in Keychain; never expose them to a WebView. The administrator must provision a read-only role, warehouse, row-access policy, and two approved views with this schema (names below are the contract, not claims those views exist):

| View                   | Required columns and semantics                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPEN_LOOPS_V`         | `ACTOR_ID`, globally stable `LOOP_ID`, `SOURCE_SYSTEM`, `RECORD_ID`, `KIND`, `STATUS`, `TITLE`, `SUMMARY`, `SOURCE_URL`, `SOURCE_REVISION`, source `CREATED_AT`, `UPDATED_AT`, optional `LAST_MEANINGFUL_ACTIVITY_AT`; UTC timestamps, explicit null handling |
| `OPEN_LOOP_EVIDENCE_V` | `ACTOR_ID`, `LOOP_ID`, stable `EVIDENCE_ID`, `SOURCE_REVISION`, `OBSERVED_AT`, bounded `EXCERPT`, `SOURCE_URL`; only rows the authenticated actor may read                                                                                                    |

Identifiers come only from an admin-approved settings manifest and match `[A-Z_][A-Z0-9_]*`; bind values, never identifiers. Resolve the actor from a fixed `SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_TIMESTAMP()` probe and the approved mapping to `ACTOR_ID`. Do not accept an actor from Claude or the renderer. The Snowflake role/row-access policy remains the ultimate read boundary; a UI filter is not authorization.

Compile three query templates in Rust. `Q_PAGE` uses an upper watermark captured once per scan and keyset pagination; its bound cursor starts at an approved backfill date, not an invented workspace history:

```sql
SELECT LOOP_ID, SOURCE_SYSTEM, RECORD_ID, KIND, STATUS, TITLE, SUMMARY,
       SOURCE_URL, SOURCE_REVISION, CREATED_AT, UPDATED_AT, LAST_MEANINGFUL_ACTIVITY_AT
FROM <APPROVED_DB>.<APPROVED_SCHEMA>.OPEN_LOOPS_V
WHERE ACTOR_ID = ?
  AND UPDATED_AT <= TO_TIMESTAMP_TZ(?)
  AND (UPDATED_AT > TO_TIMESTAMP_TZ(?)
       OR (UPDATED_AT = TO_TIMESTAMP_TZ(?) AND LOOP_ID > ?))
ORDER BY UPDATED_AT, LOOP_ID
LIMIT 100
```

`Q_ONE` selects that same explicit column list for `ACTOR_ID = ? AND LOOP_ID = ? LIMIT 1`. `Q_EVIDENCE` selects the evidence columns for that actor/loop, ordered by `OBSERVED_AT DESC, EVIDENCE_ID`, `LIMIT 20`. All statuses may be read so closed/deleted eligibility can invalidate stale cards; generate new cards only for approved open/pending kinds. Clip excerpts to 2000 UTF-8 bytes each and total evidence to 32 KiB before model use; disclose truncation.

Map the authoritative source's creation timestamp to `CREATED_AT` and persist it as `quests.source_created_at`; `quests.created_at` is local discovery time and must never be used for source age. Stale means at least 30 elapsed days since source creation at the verified closure time. If the administrator cannot supply a trustworthy creation mapping, expose source-age eligibility/metrics as unavailable; do not substitute last activity, ingestion time, or local discovery time. Last meaningful activity is optional context only.

Example transport for `Q_ONE`:

```http
POST https://<approved-account>.snowflakecomputing.com/api/v2/statements?async=true&requestId=<uuid>
Authorization: Bearer <keychain-oauth-access-token>
X-Snowflake-Authorization-Token-Type: OAUTH
Content-Type: application/json
Accept: application/json
User-Agent: OpenLoops/0.1
```

```json
{
  "statement": "<compiled Q_ONE template>",
  "timeout": 30,
  "database": "<approved database>",
  "schema": "<approved schema>",
  "warehouse": "<approved warehouse>",
  "role": "<read-only role>",
  "bindings": {
    "1": { "type": "TEXT", "value": "<Rust-resolved actor>" },
    "2": { "type": "TEXT", "value": "<validated loop ID>" }
  }
}
```

On HTTP 202, persist the statement handle and poll `GET /api/v2/statements/{handle}` using asynchronous waits of 250ms, 500ms, 1s, then at most 2s, bounded by the job deadline. HTTP 408 from status checking is still pending; 422 is a terminal SQL error. On 200, validate `rowType`/column types and decode `jsonv2` rows by metadata, preserving SQL null rather than turning it into the string `"null"`. Read every `partitionInfo` partition via `GET /api/v2/statements/{handle}?partition=N`; do not call the first partition a complete result. Construct URLs from the approved origin and validated handle, not arbitrary returned links.

Limit a scan attempt to 1000 rows and ten pages; reaching the cap is a checkpointed partial scan with explicit continuation, not “all clear.” Cancel with `POST /api/v2/statements/{handle}/cancel`, then reconcile status; a network timeout is not proof of cancellation. Retry a submission only with the same `requestId` and Snowflake's `retry=true`; GETs may retry within budget. Respect `Retry-After` on 429. A 401 pauses for credential renewal, 403 blocks the role/scope, and malformed rows fail that page without advancing its checkpoint.

### Anthropic Claude: bounded card-pack and execution loops

`anthropic.rs` calls only `https://api.anthropic.com/v1/messages` with `x-api-key` loaded from the app's dedicated Keychain entry, `anthropic-version: 2023-06-01`, and `Content-Type: application/json`. Use the exact approved `model_id` from settings, verified with Anthropic's models API; do not silently substitute another model or subscription login. The API credential must belong to the approved Anthropic organization/workspace.

Each request uses `stream: true`, `max_tokens: 2048`, a fixed safety/system prompt, and only the tool schemas for the current phase. Hard ceilings per job attempt: four model turns, four evidence reads, 20,000 input tokens per request, 60,000 cumulative input tokens, 8192 cumulative output tokens, and 180s elapsed time. Use the token-count endpoint before submission; stop rather than truncating safety instructions. A draft exceeding budget fails with `budget_exceeded`. A bootstrap attempt reaching a row/model/time cap becomes `partial`, commits only completed packs and their cursor, and requires explicit continuation for remaining rows. Record returned usage and provider request IDs, not keys or raw conversation logs.

Tool definitions are sent in `tools[]` with `name`, `description`, and `input_schema`; all objects disallow additional properties. The read tool is exact and shared:

```json
{
  "name": "read_loop_evidence",
  "description": "Read approved evidence for the current loop only. Returns cited excerpts, source revisions and observed times. Cannot query arbitrary SQL, other actors or external URLs.",
  "input_schema": {
    "type": "object",
    "properties": { "loop_id": { "type": "string", "maxLength": 200 } },
    "required": ["loop_id"],
    "additionalProperties": false
  }
}
```

Rust additionally requires `loop_id` to equal the current job's approved loop and rechecks actor/scope before `Q_EVIDENCE`. No SQL, shell, filesystem, browser, computer-use, network-fetch, send, close, or approval tool is exposed.

For bootstrap, the terminal tool is `submit_card_pack`. Its JSON Schema requires `title` (1–120 chars), `summary` (1–600), `evidence_ids` (1–20 distinct known IDs), and `options` (2–3 generated objects). Each generated option requires `label` (1–100), `kind` in `summary|question_draft|closure_recommendation`, `brief` (1–4000), and nonempty known `evidence_ids`; all other properties are rejected. Rust assigns stable IDs and immutable read/draft scope. It also persists one **app-owned Other option** at ordinal `0`, kind `steering`, with a stable UUID derived from the quest UUID and `other`; generated options use ordinals `1..3`. Store Other's prefilled prompt in `prompt_revisions` against that option before emitting `quest.ready`. Editing, export, or explicit API acceptance of Other therefore uses the same valid FK/revision/hash path; it is not a model-generated fourth choice. Add the three snooze presets separately. Bootstrap itself grants no XP.

For an explicitly accepted job, replace the terminal tool with `submit_draft`, requiring `{text:string(1..8192), evidence_ids:string[1..20], uncertainties:string[0..10]}` with each uncertainty at most 500 chars and no extra properties. Only IDs already retrieved under this job may be cited. The system prompt includes the exact accepted prompt revision/hash, read-only limits, relevant excerpts as untrusted quoted data, and “return a draft; never claim anything was sent, approved, or closed.”

A terminal submission must be the sole tool call in its message. Reject mixed terminal/read calls rather than accepting citations to evidence not yet returned. Expose only the current phase's terminal schema, and validate every length, enum, array bound and evidence ID locally even if the chosen model supports strict tool schemas.

Loop algorithm:

1. Send the system prompt, current user task, approved context and tool schemas. Buffer SSE by content-block index: `message_start`, `content_block_start`, deltas, block stop, `message_delta`, `message_stop`; tolerate ping/unknown nonsemantic events. Do not execute partial JSON from `input_json_delta`.
2. After a complete message, append its full assistant content to the in-memory conversation. For each `tool_use`, validate the name/arguments and quota; execute only the fixed read or validate the terminal submission. Return one user message containing matching `{type:"tool_result", tool_use_id, content, is_error?}` blocks before another model request. Never fabricate tool-result IDs.
3. A valid terminal submission finishes the job only after transactionally persisting its result/event. `tool_use` continues only within budget. `end_turn` without a valid terminal submission is `invalid_output`, not a successful blank result. `max_tokens`, `model_context_window_exceeded`, refusal, malformed arguments, and unexpected `stop_sequence` are explicit terminal errors. A `pause_turn` may resume the intact response within the same four-turn/deadline budget, never indefinitely.
4. On 401/403, stop and require credential/organization access repair. On 429/529 or transient 5xx before output, retry at most twice within deadline, respecting `Retry-After`; no automatic retry of a partially received tool/result stream. Stream error or premature EOF is `interrupted`, not a completed draft. SSE can carry an error even after HTTP 200.
5. Cancellation sets the durable flag, aborts the Rust HTTP stream and pending Snowflake handle, and prevents further tool execution. Any late callback retains its originating identity and cannot resurrect a canceled job. User-requested retry is a new job attempt under the existing acceptance, without extra XP.

Live source mutation is not part of either tool set. An optional later source connector still requires separate exact-target approval, fresh authority checks, stable action IDs, and matching authoritative readback.

Before a source operation, show full payload, record/recipient, action, and consequences in a separate confirmation. Re-fetch authoritative current state and actor permission; stale Snowflake snapshots alone cannot validate a write. Reject denied access, changed revision/status, missing evidence, or changed payload. Use an idempotency/action ID where the source supports it, then read back from the authority.

| Outcome                                             | UI / persistence rule                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Prepared draft or recommendation                    | Source unchanged; never announce sent, approved, or closed.                                    |
| Confirmed matching readback                         | Record source-confirmed outcome and timestamp. Count an eligible distinct closure once.        |
| Permission denied / stale source / missing evidence | Preserve draft; explain recovery; require a fresh review after changes.                        |
| Timeout or ambiguous response                       | Outcome unverified; reconcile by action ID/source state before retry. Never say safely failed. |
| Browser simulated receipt                           | Fixture result only, source unchanged; never enters real business metrics.                     |

## 7. Personal observability — separate My day surface

My day is an optional read-oriented dashboard, not a second decision interface or surveillance feature. Its browser version uses synthetic records; live data ownership is proposed Rust + the **same SQLite database**. No remote telemetry collector, analytics backend, OpenTelemetry deployment, or second event database is required.

Show a chronological activity timeline, accepted quests versus source-confirmed outcomes, agent jobs and recoverable failures, and memory with source provenance. Each item distinguishes **observed**, **inferred**, and **demo**. Label missing coverage; do not equate lack of AX events with inactivity or infer productivity from elapsed app time. User review/deletion and retention remain explicit policy gates. My day's WebView cannot initiate privileged capture, approve jobs, or write sources through its read capability.

### Measurement definitions

| Metric                                               | Definition and exclusion                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision time                                        | Elapsed time from recorded `question_submitted` to the person's explicit `decision_confirmed`, linked by question ID. Exclude unrelated scan/job completion timestamps. Show sample count and unresolved questions; do not invent a pre-question start time.                                                                          |
| Distinct stale loops source-verified closed per week | Count distinct source+record identities with matching authoritative closure readback during Monday–Sunday UTC weeks that were at least 30 days old **since source `CREATED_AT`** at closure. Exclude reopened records, missing creation mappings, suggestions, XP, drafts, demo records, duplicate readbacks and unverified outcomes. |
| Acceptance / XP                                      | Unique explicit acceptances and derived companion stage. Display separately from confirmed business outcomes.                                                                                                                                                                                                                         |
| Job health and provenance                            | Status, duration where measured, cancellation/error reason, approved provider, evidence refs, and result links. No secrets or raw captured content.                                                                                                                                                                                   |

Reporting weeks are Monday–Sunday UTC, reopened records are excluded, and age is measured from authoritative source creation. The administrator must map that field; if unavailable, source-age metrics remain unavailable. Never derive business age from local `quests.created_at`. Count each eligible source+record once per reporting week. Decision-time aggregation remains a release choice; creation-versus-activity is no longer an open decision.

## 8. Implementation order and four-hour vertical slice

### Prerequisites — check before starting the estimate

The estimate assumes a macOS development machine with working Xcode/Command Line Tools, Rust and Tauri v2 toolchain, plus access to the final approved browser source. Confirm exact versions and minimum supported macOS rather than assuming this machine proves distribution support.

The live native slice requires approved Snowflake account/views, actor/row scope, OAuth setup, and a separately approved Anthropic Messages API credential/model/data policy. Credentials live in macOS Keychain. Existing agent-host Codex/Claude Code login tokens must not be reused. Missing values stop live connection tests; they are not replaced by guessed credentials or simulated success. Manual clipboard/tool-page export remains independent.

For native context or distribution, also require an allowed target app, test consent for TCC prompts, a stable bundle ID, appropriate signing identities/entitlements, and selected architectures/minimum OS. Screenshot capture additionally needs its separate permission and confirmed ScreenCaptureKit API availability. Missing prerequisites become visible blocked gates, never fake live success.

### Selected scaffold: Better-T Stack

Use **Better-T Stack 3.48.0**, Bun, React/Vite, TanStack Router and its official Tauri addon. Select no JavaScript backend, auth service, API framework, database or ORM; Rust still owns Snowflake, Anthropic, SQLite and Keychain. This combination passed the CLI's dry-run compatibility check. Generation, installation and native builds have not run.

The proposed generated workspace is `desktop/`. All `src-tauri/...` shorthand in this plan is relative to `desktop/apps/web/`; its repository path is `desktop/apps/web/src-tauri/...`. The verified preflight command runs from an isolated staging directory, not this repository root:

```sh
bunx create-better-t-stack@3.48.0 open-loops-bts-preflight \
  --frontend tanstack-router \
  --backend none \
  --runtime none \
  --database none \
  --orm none \
  --api none \
  --auth none \
  --payments none \
  --db-setup none \
  --addons tauri \
  --examples none \
  --web-deploy none \
  --server-deploy none \
  --package-manager bun \
  --no-install \
  --no-git \
  --open none \
  --directory-conflict error \
  --disable-analytics \
  --no-render-title \
  --dry-run --verbose
```

Only after generation is authorized, remove the dry-run flags, inspect the output, and move the complete workspace into `desktop/` without a nested Git repository or caches. Do not add `--yes`, force the CLI through `bunx --bun`, or overwrite this repository. `--no-install` still allows the Tauri addon to execute `@tauri-apps/cli@latest init`; the BTS version pin is **not** a complete dependency lock. Record the resolved Tauri version and commit `bun.lock`/`Cargo.lock` after the approved install/build.

Expected frontend entry points are `desktop/apps/web/src/main.tsx` and `src/routes/`; native files are under `desktop/apps/web/src-tauri/`. Port the approved UI behavior into those React views rather than replacing it with starter screens. Keep the existing preview and root lockfile intact. The generated `apps/web` package provides `desktop:dev` and `desktop:build`; no extra workspace runner is needed. Sources: [official options](https://www.better-t-stack.dev/docs/cli/options), [Tauri compatibility](https://www.better-t-stack.dev/docs/cli/compatibility#tauri-desktop-apps), and [pinned addon implementation](https://github.com/AmanVarshney01/create-better-t-stack/blob/77d306e1209fb3a4d34082ddb950fafdeb93ba44/apps/cli/src/helpers/addons/tauri-setup.ts).

### Proposed file/module sequence

| Order                              | Future files                                                                                                                                                | Responsibility / dependency                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Host and boundary               | Generated React/Vite entry points, `src-tauri/{Cargo.toml,tauri.conf.json,build.rs}`, `src-tauri/src/{main.rs,lib.rs,commands.rs}`, per-window capabilities | Port the approved UI into separate buddy/info/deck windows and optional My day; preserve behavior and enforce narrow commands.                                     |
| 2. State and bootstrap             | `src-tauri/src/store.rs`, `jobs.rs`; renderer bridge at existing state owner                                                                                | SQLite schema/FTS, unique acceptance, event journal/checkpoints, snapshot/replay, async startup/retry/cancel, card append without focus/draft reset.               |
| 3. Snowflake + Anthropic execution | `src-tauri/src/snowflake.rs`, `anthropic.rs`, `jobs.rs`, `commands.rs`; separate `handoff.rs`                                                               | Fixed bound Snowflake reads, validated Claude card-pack/read-draft loop, consent, budgets, cancellation, and truthful results. Manual handoff remains independent. |
| 4. Optional authorized extensions  | `src-tauri/src/context.rs`, `native/ContextObserver.swift`; later `src-tauri/src/source_actions.rs`                                                         | Normalize AX/native messages; separately gated still capture. Implement source connector only with actual authorization and authoritative readback.                |
| 5. History, checks, packaging      | Existing My day HTML + narrow bridge; focused Rust checks and browser workflow check; Tauri bundling configuration                                          | Same-store read model, metrics/provenance, recovery checks, bundle helper/resources, sign/notarize and validate installed app behavior.                            |

These are planning names. No empty module, mock connector, TODO implementation, or generated scaffold is delivered in this documentation task. Follow actual final source organization rather than splitting one HTML into speculative modules merely to match this table.

### Four hours = 240 minutes, conditional development slice

| Time        | Bounded work                                                                                      | Exit evidence                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0–30 min    | Host verified browser surface in Tauri; wire one narrow command and restrictive capability policy | Local WebView displays; allowed command works; unknown command/window/invalid payload denied.                                   |
| 30–85 min   | Implement store + job owner, scan events, snapshots/checkpoints, unique acceptance                | First card before scan completes; close/reopen and duplicate acceptance preserve state/XP; failures do not erase cards.         |
| 85–150 min  | Implement fixed Snowflake reads and bounded Anthropic card-pack/read-draft execution              | Validated packs, cited results, tool-schema/actor checks, cancellation and quota limits                                         |
| 150–195 min | Complete companion lifecycle and minimal same-store My day history/provenance                     | Back/Close/focus/draft stable; acceptance vs source outcome distinct; actual job events visible.                                |
| 195–240 min | Run focused behavioral/security checks and development package smoke                              | Record exact versions, exercised files, failures, and one end-to-end read/accept/draft path. No release claim from a dev build. |

### One-shot execution brief and stop gates

“One-shot” means an unambiguous agent work order, not a guarantee that unknown accounts, credentials, native toolchains, or permissions will work. Implement the existing renderer and the contracts above without inventing another backend or a provider abstraction.

**Preflight settings schema:** one approved `bundle_id`, `snowflake_origin`, `database`, `schema`, `warehouse`, `role`, `loops_view`, `evidence_view`, `actor_mapping`, `backfill_from_utc`, and `anthropic_model_id`; plus OAuth authorize/token URLs, client ID, registered loopback redirect and scopes from the administrator. No secret is serialized in this settings object. Save nonsecret config in `settings`; use Keychain service names `${bundle_id}.snowflake.oauth` and `${bundle_id}.anthropic.api`, account `default`.

Settings onboarding shows configured account/model, disclosure of exactly what source data will be sent to Anthropic, and connection status—not tokens. `connect_snowflake` starts a system-browser OAuth authorization-code flow with PKCE S256, random state, a one-use localhost callback matching the registered redirect, and a three-minute expiry. Rust validates state and exchanges the code, storing access/refresh tokens only in Keychain. If the approved OAuth registration cannot support this desktop flow, stop for an administrator; do not switch to passwords or another actor's token. Refresh only through the configured token endpoint, serialize refresh, and fail closed on revocation.

Provision the Anthropic API key through macOS Keychain Access's secure password-entry UI or another explicitly approved native credential channel, never a WebView field, command-line argument, repository file, or agent-host login cache. `test_connections` is an explicit action: probe Snowflake identity/role and column contracts, check the approved Claude model and a bounded test request, then report actual results. Missing access leaves live controls disabled with a specific reason while local fixtures remain visibly separate.

| Order                        | Files to implement once                                                                                                                                   | Exit gate                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Native shell and IPC      | `src-tauri/{Cargo.toml,build.rs,tauri.conf.json}`, `src-tauri/src/{main.rs,lib.rs,commands.rs}`, permissions/capabilities, web `src/lib/native-bridge.ts` | Approved card UI runs in WKWebView; unknown command/window/payload denied; renderer has no direct HTTP or secrets                            |
| 2. State and replay          | `src-tauri/src/store.rs`, `src-tauri/src/jobs.rs`; migration above; one cancellation token per Rust job                                                   | SQLite rollback/restart/replay and duplicate acceptance tests pass; first complete card arrives before full scan ends                        |
| 3. Credentials and Snowflake | `src-tauri/src/credentials.rs`, `src-tauri/src/snowflake.rs`, settings/connection view in the existing deck                                               | Verified actor/role/view schema; bound-query, 202/poll/partition/cancel/401/403/429 tests; no raw model SQL                                  |
| 4. Claude execution          | `src-tauri/src/anthropic.rs`; reuse `jobs.rs`/DTO validation; optional export in `src-tauri/src/handoff.rs`                                               | Complete validated packs, explicit acceptance, tool-result matching, budgets, cancellation and stale-callback tests; no live source mutation |
| 5. Native acceptance/package | read-only My day bridge; native integration tests and Tauri bundle config                                                                                 | Real authorized Snowflake → Claude card → accept → cited draft smoke, then installed WKWebView/permission checks; no fixture counted as live |

The web package's `src/lib/native-bridge.ts` maps React actions to the exact IPC contract. Native domain state comes from snapshots/events, not a competing fixture store. Keep the browser prototype separate and retain the approved UI behavior when porting it. Use Vite's generated `dist/` and the Tauri addon's `frontendDist: "../dist"` relation; bundle reviewed local assets instead of CDN scripts. All network authority remains in Rust.

Use Tauri v2, Serde, `rusqlite` with bundled SQLite, `reqwest` with TLS, UUIDs, Tauri's async runtime/Tokio primitives, and one Keychain adapter. Pin compatible versions and commit `Cargo.lock` when the native project is actually created; do not create empty native modules now. No separate server, queue service, vector database, agent framework, or multi-provider router is required. Bundle the current CSS/JS/sprite locally and remove runtime CDN dependencies from the native renderer.

Bun is the local frontend/package runner; the generated web package exposes the Tauri desktop scripts. Rust still builds with Cargo. The existing root Node 24 preview CI/lockfile remain unchanged; add native workspace checks only with the future implementation.

**Native acceptance commands**, after the real project exists:

```sh
cd desktop/apps/web
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
bun run desktop:dev
bun run desktop:build
```

Keep existing browser gates as additional regression coverage. Extend path-aware CI to native sources only when those files exist; a browser Chromium pass is never a WKWebView or Rust build pass.

The real smoke is bounded and explicit: authorize a test actor's read-only views and Anthropic data transfer; start one scan; observe a complete cited card before terminal scan status; choose and edit one read/draft option; Accept once; observe one Claude job and a cited draft with source unchanged; close/reopen and restart, confirming retained placement/state and no duplicate XP. Record account/role/model IDs in redacted form, source revision, job ID, token usage, and actual outcome. Missing prerequisites stop the live smoke without claiming success.

| Test boundary                    | Required observable result                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Snowflake contract/authorization | Wrong columns/types, wrong actor, forbidden role and cross-actor loop ID fail closed; all partitions processed once; partial caps labeled                                                              |
| Claude tool loop                 | Unknown tools/SQL/URLs, extra JSON fields, foreign evidence IDs, truncated stream, refusal, quota and 401 fail safely; no tool executes from partial JSON                                              |
| Transaction/replay               | Crash before commit emits nothing; crash after commit replays one event; acceptance/request replay yields one XP award and one active job                                                              |
| Cancellation/concurrency         | Cancel during poll/stream prevents late success; changing quest/draft cannot redirect an old job; retry does not re-award XP                                                                           |
| Actual macOS app                 | Inspect real WKWebView at 320/390 widths and real motion; open-drop retention, focus, clipboard denial and external export; Accessibility/Screen Recording remain unrequested until separately enabled |

Optional AX/ScreenCaptureKit and signed distribution follow their existing separate gates. Verify denied/revoked TCC permissions and signed app/helper identity on macOS if those features are implemented; the read-only Snowflake/Claude slice must work without either permission. Test the installed app, not only `tauri dev`, before making native packaging claims.

Protocol references: [Snowflake authentication](https://docs.snowflake.com/en/developer-guide/sql-api/authenticating), [SQL submission/bindings](https://docs.snowflake.com/en/developer-guide/sql-api/submitting-requests), [poll/partition/cancel API](https://docs.snowflake.com/en/developer-guide/sql-api/reference), [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create), [tool schemas](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools), [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), and [Tauri permissions](https://v2.tauri.app/security/permissions/). These define proposed integration behavior, not evidence of executed live requests.

The earlier 240-minute timebox is a development checkpoint guide, not a promise that Snowflake/OAuth provisioning, Claude account access, native sensing, source writes or notarized distribution complete in four hours. The ordered native execution contract and explicit prerequisite gates take precedence over that estimate; missing access is reported, never relabeled as a live success.

### Later gated work — still part of the plan

Native AX, selected-window capture, real source writes, and distribution need their own implementation and acceptance after the narrow path. Budget a separate integration session for each, not hidden time inside the four-hour estimate. Actual duration depends on TCC behavior, source API support, signing/notarization access, and target application AX coverage. Keep each unavailable capability visibly absent rather than adding fake controls.

## 9. Validation and check scenarios

This is a **future acceptance matrix**, not a claim these checks have run. Historical 61-check evidence covers a superseded browser revision. Final browser verification must name exact files/screenshots and distinguish automated checks, visual review, and untested native behavior.

### Companion and accessibility

1. Inspect rendered closed/open, snooze, choices, evidence, edited brief, acceptance/running/result, source-action review, and 20/30-XP states at desktop and 390/320px widths. Near bottom, require deck including circular actions, buddy, info in that order. Automatic fitting preserves the resting anchor; deliberate open/closed drops replace it. Verify placement survives close/reopen, with no decorative buddy movement in real motion-enabled mode.
2. Assert no navigation landmark or Back button inside any decision card. The external green circle returns to the parent; Close stays in info. Test Escape, outside close, reopening, canceled drag, fast input, real touch scrolling/swiping, selectable text, and focus return. Info must not animate with deck navigation.
3. Accept only through the explicit button; verify +10 once for unique quest ID, no XP for swipe/snooze, no additional XP on retry, and XP retained after post-accept cancellation. Check Pip/Scout/Guide derived thresholds.
4. Check 200% zoom, long briefs, 44px targets, keyboard without pointer, reduced motion, muted/unavailable audio, and no hidden essential action. Review active states visually, not just source declarations.
5. Verify quiet idle does not open, focus, play sound, or dispatch; browser virtual timer evidence is labeled simulation. Native OS idle behavior requires a packaged/runtime check.

### Bootstrap, persistence, and command boundary

1. Delay a real source; first quest arrives before complete. Exercise zero-card processing, successful-empty, partial failure, and full failure without contradictory all-clear copy.
2. While editing or confirming, emit new quests/events; active draft, card, focus, and selection remain. Close/reopen, disconnect/reconnect listener, inject duplicate/out-of-order event delivery, and verify ordered replay from durable state.
3. Restart between checkpoint and emit; resume safely without duplicate quests, acceptance, or source effects. Repeat start/retry request IDs. If DB transaction fails, do not emit fictional durable success.
4. Deny unknown window/origin/command, malformed or oversized arguments, arbitrary SQL/path/URL, unauthorized source/actor, and source/model prompt injection. Verify no renderer shell, secrets, DB handles, or broad native access.
5. Validate cancellation, expired credentials, network timeout, provider failure, and rate limiting with specific recovery. Native app exit stops work; reopening does not imply a separate always-running service.

### Native context, source safety, and observability

1. Test Accessibility denied/revoked, unsupported AX content, app allowlist changes, helper crash/malformed messages, and TCC behavior with the signed installed identity. Unknown content stays unknown.
2. Test screen permission independently; cancellation, local preview/masking, exact-image/destination reapproval, discard/expiry, and zero background upload. Confirm no raw screenshot or secret remains in logs/SQLite/default retained files.
3. Revoke actor permission or alter source state/payload between review and execution. Block stale/missing/denied writes. Simulate accepted network request followed by timeout: reconciliation precedes retry; no false closure receipt.
4. Confirm source readback mismatch remains unverified. Deduplicate eligible stale closures by source identity and reporting week; exclude demo, acceptance, draft, and XP from business metrics.
5. Check My day observed/inferred/demo labels, missing coverage, memory citations/expiry, unresolved decision time, and read-only capability. It must not bypass the companion's approval boundary.

Use a small number of runnable behavior checks at real boundaries; a SQLite-backed check for transactional acceptance/checkpoints, browser interaction checks, and focused installed-app tests where native behavior exists. No broad mock-framework scaffold is required. Record only checks actually executed and their exact outcomes.

## 10. Packaging and release boundary

Package renderer assets locally through Tauri configuration. Bundle the Swift executable with `externalBin`/resources as appropriate, using the correct target-suffixed binary naming and architecture support; have Rust spawn only that verified packaged helper. Pin compatible Tauri/Rust dependencies and retain the application lockfile.

Select bundle identifier, minimum macOS, entitlements, hardened runtime, signing order for nested helper/app, and notarization credentials under the user's release policy. Validate the signed installed app, not just development binaries: helper launch, permissions attributed to the expected identity, denied/revoked permissions, upgrades, app relocation, and quarantine/notarization behavior. Transparent window, always-on-top preferences, click-through regions, and focus behavior need real macOS validation.

GitHub publication and preview delivery are authorized; repository visibility and enforcement receipts are in [CI.md](CI.md). This does not authorize native distribution, signing-identity changes, public hosting, live credentials, or automatic updates. A development smoke does not establish App Store eligibility, production privacy compliance, or cross-version compatibility.

## 11. Skills and preserved guidance

The design guidance uses `app-dashboard` for legible, bounded interfaces and `code-clarity` for ownership and derived state. These are implementation references, not runtime dependencies or permission grants.

Apply app-dashboard/shared-basics for legible choices, one primary action, explicit confirmation, honest loading, relative units, and accessible feedback. The explicit physical-card requirement overrides generic advice to remove borders. Apply code-clarity for one authoritative lifecycle, derived XP, scoped ownership, and failure distinctions based on real recovery. Its Electron-specific reference is historical guidance only: translate trust-boundary principles to Tauri, **do not reinstate Electron**.

Ponytail: smallest complete working slice, native/standard facilities first, no speculative service or framework. Caveman governs chat brevity, not document readability. Archify/Lavish guidance informed the decision to use Mermaid; this deliverable does not generate another diagram runtime or edit the ongoing review surfaces. The complete 35-skill catalog is not duplicated into this plan.

## 12. Handoff, snapshot, and open decisions

### This checkpoint

README, this reference, and `.gitignore` began in an isolated initialized repository. Native paths remain proposed only. Final browser imports and exact hashes belong in [verification/snapshot.json](verification/snapshot.json); [CI.md](CI.md) owns publication and exercised checks. This plan fixes the native providers as Snowflake + Anthropic; it does not claim live model requests, source writes, captures, or permission grants have occurred.

### Source synchronization

Copy only the approved final source/sprite/spec/evidence set. Extract inline application JS/CSS for real lint/Sentrux coverage and check the transformed repository copy. Record changed source and imported hashes; do not import old 61-check evidence as final proof or silently inherit checks after source changes.

### Unresolved facts

| Fact                                                                                                                           | Gate it blocks                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Snowflake account origin, OAuth registration, database/schema/views, read-only role/warehouse, actor mapping and freshness SLA | Real scoped evidence and connection smoke                                                                                  |
| Approved Anthropic Messages API key, accessible exact Claude model ID, budget/data policy                                      | Live Claude execution; host subscription tokens are not substitutes                                                        |
| Source API/connector, permission model, revision/idempotency/readback support                                                  | Any real send, approve, or close operation; excluded from first read/draft slice                                           |
| App allowlist, retention/delete policy, source `CREATED_AT` mapping, macOS targets/signing identity                            | Optional sensing/release and metric availability; creation-based age, Monday–Sunday UTC and excluding reopened are settled |

These are missing inputs, not permission to guess or claim unavailable capabilities.

### Primary technical references

- [Tauri architecture](https://v2.tauri.app/concept/architecture/)
- [Tauri capabilities](https://v2.tauri.app/security/capabilities/)
- [Tauri command permissions](https://v2.tauri.app/security/permissions/)
- [Tauri sidecar packaging](https://v2.tauri.app/develop/sidecar/)
- [Apple AXObserver](https://developer.apple.com/documentation/applicationservices/axobserver) and [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)

References describe proposed integration choices, not proof that this repository already implements them.
