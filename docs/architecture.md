# Open Loops — proposed Tauri execution architecture

**Proposal only:** the HTML is a simulation; no native access, sync, database, model call, or source write is implemented. The selected native integration is **Snowflake SQL API + Anthropic Claude Messages API**, both called only by Rust. External Claude/Codex manual handoff remains an optional export.

On macOS, Tauri v2 renders in the system **WKWebView**, not Chromium. Chromium tests the browser preview only; native acceptance must run in the packaged Tauri app. Separate buddy, info, and deck windows share Rust-owned state, with optional normal My day. Deliberate drops replace the resting anchor; automatic boundary fitting does not; open drag moves info without moving the deck. No decorative buddy bounce. The [implementation contract](implementation-plan.md) owns exact command DTOs, SQLite transactions, connector protocols, stop gates, and the native build/smoke sequence.

## 1. Components and trust ownership

```mermaid
flowchart TB
  accTitle: Proposed Tauri macOS ownership
  BUDDY["Tiny transparent buddy WebView<br/>Placement, open/close, minimal status<br/>No secrets, shell, SQL or native APIs"]
  INFO["Independent bounded info WebView<br/>Always below displayed buddy<br/>Status, XP, mute, Close"]
  UI["Independent bounded deck WebView<br/>5:7 card, options, prompt review, Back<br/>Own bounds and animation; listen before snapshot"]
  DAY["Optional normal My day WebView<br/>Read-only history and memory provenance<br/>No secrets or separate telemetry store"]
  ACL["src-tauri/build.rs<br/>AppManifest::commands permissions<br/>capabilities/*.json: per-window least privilege"]
  CMD["src-tauri/src/commands.rs<br/>Narrow typed commands<br/>Validate arguments AND window origin"]
  CORE["src-tauri/src/lib.rs + jobs.rs<br/>Rust async runtime; bootstrap job owner<br/>Dedup, checkpoint, approvals, retention/capture controls"]
  CTX["src-tauri/src/context.rs<br/>Bounded normalize, debounce, diffs<br/>Unsupported AX content stays unknown"]
  NATIVE["native/ContextObserver.swift<br/>AXObserver + AXUIElement: one allowed app<br/>Optional ScreenCaptureKit selected-window still"]
  DB[("Same Rust-owned SQLite via store.rs<br/>Activity timestamps, observed/inferred provenance<br/>Memory refs, jobs, checkpoints, snoozes, acceptance XP<br/>Verified closure stored separately from XP")]
  RAM["Short-lived RAM<br/>Raw screenshot + working context<br/>Discard images after consented use"]
  KEY["macOS Keychain<br/>Narrow Rust/native credential API<br/>Does not encrypt SQLite"]
  SF["Snowflake SQL API / approved read-only views<br/>OAuth in Keychain; fixed bound queries<br/>Actor/row authorization; async poll/partition/cancel"]
  P["Anthropic Claude Messages API<br/>Approved model + separate API key in Keychain<br/>Validated card packs and bounded read/draft jobs"]
  SRC["Optional authorized source API<br/>Existing connector only<br/>Fresh approval, write, authoritative readback"]
  TOOL["External Claude or Codex page<br/>Fixed allowlisted URL; user pastes manually<br/>Own permissions, outside app sandbox"]
  UI <-->|"invoke + sequenced events / snapshot"| CMD
  BUDDY <-->|"placement / open-close / minimal status"| CMD
  INFO <-->|"status / mute / close only"| CMD
  DAY <-->|"narrow read-only commands; per-window capability"| CMD
  ACL -.->|"custom commands are NOT restricted by default"| CMD
  CMD <-->|"validated intent only"| CORE
  CORE <-->|"checkpoint before emit"| DB
  CORE <-->|"minimal working context"| RAM
  KEY -->|"Rust only"| CORE
  CORE -->|"spawn only packaged helper; no frontend shell"| NATIVE
  NATIVE -->|"bounded validated JSON lines"| CTX
  CTX --> CORE
  CORE <-->|"fresh scoped reads"| SF
  CORE <-->|"approved context only"| P
  CORE <-->|"second approval + status/version check"| SRC
  CORE -->|"explicit Open only; no autosubmit"| TOOL
  classDef local fill:#edf1e9,stroke:#73836a,color:#253124
  classDef external fill:#f2edf8,stroke:#8b7aab,color:#30263d
  class CMD,CORE,CTX,DB,RAM local
  class SF,P,SRC,TOOL external
```

External handoff is not an API job or an Open Loops sandbox guarantee. Copy uses the exact reviewed prompt; Open uses only a fixed Claude/Codex page without prompt-bearing URL parameters. The user pastes manually. Neither action proves a run, completion, or source change.

## 2. Runtime: first sync, cards, and approvals

```mermaid
sequenceDiagram
  accTitle: Tauri bootstrap and task runtime
  participant U as Person
  participant UI as WebView frontend
  participant R as Rust async owner
  participant DB as SQLite
  participant H as Swift helper
  participant SF as Snowflake views
  participant P as Anthropic Claude Messages
  participant S as Source API
  participant T as External Claude or Codex
  UI->>R: Register event listener, then request status snapshot
  R->>DB: Load bootstrap job, last seq and checkpoint
  R-->>UI: Snapshot including partial quests and terminal status
  opt First install or explicit retry
    UI->>R: start_bootstrap with stable job ID
    R->>R: Dedup and validate approved credentials and source scope
    R->>DB: Persist running job before work
    R->>SF: Connect and fetch bounded first batch
    R->>DB: Checkpoint source_connection and batch_loaded
    R-->>UI: Events with job_id, seq, timestamp, observed counts
    loop Bounded batches
      R->>DB: Checkpoint analyzing_batch
      R-->>UI: analyzing_batch event
      R->>P: Approved excerpts + card-pack tools, bounded budget
      P-->>R: Complete card-pack submission with evidence IDs
      R->>R: Validate options, citations and immutable read/draft scope
      R->>DB: Atomically persist validated complete card pack, checkpoint, event
      R-->>UI: quest_ready event, own options ready before card is usable
    end
    alt Source failure after zero or some quests
      R->>DB: Persist failed status and retry checkpoint
      R-->>UI: failed event, retain any ready quests
    else Scan completes, including zero quests
      R->>DB: Persist completed status and final count
      R-->>UI: completed event, empty is distinct from processing
    end
  end
  Note over UI,DB: Closing companion windows does not stop Rust job. Reopen reconciles snapshot plus seq
  Note over R,DB: App restart resumes checkpoint. No work runs while process is stopped
  opt Person enables local app context
    U->>R: Allow one app and grant Accessibility permission
    R->>H: Start packaged helper with bounded configuration
    H-->>R: Supported AX event / focus delta as JSON line
    R->>DB: Useful summary + source refs + timestamp
  end
  R->>R: OS idle reaches 300 seconds
  R->>DB: Fetch due quests and FTS matches by person/ID/recency
  R->>SF: Refresh scoped read-only evidence
  R-->>UI: Quiet badge, never auto-open or dispatch
  U->>UI: Open a quest
  alt Swipe left
    UI-->>U: Three snooze durations
    U->>UI: Choose duration
    UI->>R: Snooze quest until timestamp
    R->>DB: Persist snoozed_until, no model call or XP
  else Swipe right
    UI-->>U: Stored task choices immediately, no navigation-time model call
    opt Explicit optional screenshot
      U->>R: Select allowed window, separate Screen Recording consent
      R->>H: Capture one ScreenCaptureKit still
      H-->>R: Local image only
      R-->>UI: Preview and masking
      U->>UI: Approve exact image and approved destination
    end
    UI-->>U: Exact brief, evidence, limits, destination
    opt Other
      UI-->>U: Prefilled prepared prompt in same card
      U->>UI: Edit within hard limits, save, review, preserve parent history
    end
    alt Manual tool handoff
      Note over U,DB: Copy/Open is explicit handoff, no acceptance XP or demo job required
      U->>UI: Explicit Copy reviewed prompt
      UI->>R: Copy exact text, report clipboard success or failure
      U->>UI: Explicit Open fixed Claude or Codex page
      R->>T: Open allowlisted URL only, no prompt or autosubmit
      U->>T: Manually paste, choose whether to run
      Note over R,T: External permissions are not controlled by app sandbox, no run/completion guarantee
    else Explicitly accepted Anthropic API job
      U->>UI: Accept quest
      UI->>R: Confirm stable quest ID and reviewed prompt revision
      R->>DB: Atomic unique acceptance + 10 XP once, not source closure
      R->>DB: Queue stable approved job ID
      loop Bounded read/draft tool loop
        R->>P: Minimal approved context
        P-->>R: Draft or allowed read request
        R->>SF: Validate and run fixed read if requested
        SF-->>R: Scoped evidence
      end
      R->>DB: Result-ready or failed, retain job identity
      R-->>UI: Prepared result, not source success
    end
    opt Separate source mutation
      U->>UI: Fresh approval of exact target and payload
      UI->>R: Approved source action
      R->>S: Recheck actor permission and current status/version
      alt Authorized, current, evidence sufficient
        R->>S: Write with stable action ID
        R->>S: Authoritative readback
        S-->>R: Confirmed state or unverified outcome
        R-->>UI: Verified receipt only on matching success
      else Denied, stale, missing or timeout
        R-->>UI: No closure claimed, reconcile before retry
      end
    end
  end
```

## 3. Build order and acceptance gates

```mermaid
flowchart TD
  accTitle: Tauri vertical slices and test gates
  G{"Native prerequisite gate<br/>macOS / Rust / Tauri WKWebView<br/>Snowflake OAuth + views + actor scope<br/>Anthropic API credential + exact model"}
  F["Missing prerequisite<br/>Keep labeled fixtures / unavailable live operation<br/>No invented connection or sync result"]
  A["1. Host existing frontend in buddy/info/deck windows<br/>Optional normal My day window<br/>src-tauri/build.rs: AppManifest::commands<br/>capabilities/*.json per-window permissions<br/>Gate: deny unknown command/window/args"]
  B["2. Durable local state and bootstrap<br/>store.rs: rusqlite schema + FTS + checkpoints<br/>jobs.rs: async job + seq/event + snapshot/replay<br/>Gate: first card before complete; zero/empty/failure distinct<br/>Close/reopen and restart dedup; unique acceptance XP"]
  C["3. Snowflake evidence + Anthropic core<br/>Validated complete packs before quest_ready<br/>Explicit acceptance starts bounded read/draft job<br/>Gate: actor scope, tool schema, quotas, cancellation"]
  API["Optional manual export<br/>Exact Copy and fixed Claude/Codex Open<br/>No job or XP merely for export"]
  H["Optional native context slice<br/>native/ContextObserver.swift<br/>tauri.conf.json externalBin + target-suffixed binary<br/>Rust spawns packaged helper only<br/>Gate: signed app/helper TCC identity; AX denial/unknown content"]
  I["Optional screenshot slice<br/>ScreenCaptureKit in the same helper<br/>Separate permission + local preview/mask + send consent<br/>Gate: denial, discard, expiry; no continuous upload"]
  W["Optional source-write slice<br/>Rust-only authorized connector<br/>Gate: exact approval, permission/status recheck<br/>Timeout reconciliation and verified readback"]
  T["Verified native read / accept / draft workflow<br/>No new backend, queue service, WebSocket bus,<br/>vector DB, arbitrary shell or provider framework"]
  G -->|"missing"| F
  G -->|"approved"| A
  A --> B --> C --> T
  B --> H --> I
  C --> API
  I -->|"separately approved minimal context"| C
  C -->|"existing source connector authorized"| W
  W --> T
  classDef gate fill:#f7efdf,stroke:#a58a56,color:#3c3220
  classDef slice fill:#edf1e9,stroke:#73836a,color:#253124
  class G,F gate
  class A,B,C,API,H,I,W,T slice
```

## 4. Onboarding UI tree — native target, browser simulation

This diagram specifies the native target; the current browser's setup choices remain simulated. Source access, Anthropic credentials and evidence-transfer consent come before the first live scan. Optional Accessibility, screen capture and per-image upload are separate approvals. No credential value enters a WebView.

```mermaid
flowchart TD
  accTitle: Proposed native onboarding — no live access in this preview
  W["Welcome<br/>First-run companion"]
  C["Connect Snowflake<br/>System-browser OAuth + approved views"]
  A{"Verify actor, role and view contract"}
  V["Source access verified<br/>Scoped read-only evidence"]
  AI["Configure Anthropic<br/>Dedicated Keychain API credential + exact model"]
  AM{"Verify model access"}
  AF["Model access failed<br/>Repair credential or model permission"]
  CONSENT{"Allow cited evidence to Anthropic?"}
  MANUAL["Live analysis disabled<br/>Optional reviewed manual export only"]
  F["Connection failed<br/>Fix access or retry"]
  AX["Optional app context<br/>Accessibility permission screen"]
  AXA["Allow selected app context<br/>Native permission, separate from upload"]
  AXS["Skip app context<br/>Data-only operation"]
  SS["Optional screenshot context<br/>Separate Screen Recording permission"]
  SSA["Allow screenshots<br/>Still requires per-image preview / send consent"]
  SSS["Skip screenshots<br/>No capture"]
  START["Start first scan<br/>Explicit action; no XP"]
  STREAM["Persisted scan activity<br/>Browser counterpart uses labeled fixtures"]
  WORK["Keep working<br/>Collapse companion; retain scan state"]
  REOPEN["Reopen companion<br/>Restore activity / current quest"]
  READY["First complete card pack ready<br/>Review now while scan continues"]
  DECK["Same decision card<br/>Stored options / prompt review / explicit API acceptance"]
  EMPTY["No quests found<br/>Only after successful scan completion"]
  PART["Some quests ready; scan incomplete<br/>Review available quests + retry failed source"]
  FAIL["Scan could not finish<br/>No quests ready; fix access / retry"]
  W --> C --> A
  A -->|verified| V --> AI --> AM
  AM -->|verified| CONSENT
  AM -->|failure| AF --> AI
  CONSENT -->|yes| AX
  CONSENT -->|no| MANUAL
  A -->|failure| F --> C
  AX --> AXA --> SS
  AX --> AXS --> SS
  SS --> SSA --> START
  SS --> SSS --> START
  START --> STREAM
  STREAM -->|keep working| WORK --> REOPEN
  REOPEN --> STREAM
  STREAM -->|first quest_ready| READY --> DECK
  STREAM -->|complete with zero quests| EMPTY
  STREAM -->|some sources failed| PART
  STREAM -->|all sources failed| FAIL
  PART -->|review| DECK
  PART -->|retry failed source| STREAM
  FAIL -->|fix access| C
  FAIL -->|retry| STREAM
  classDef screen fill:#fcfcf7,stroke:#73836a,color:#27332d
  classDef failure fill:#f7efdf,stroke:#a58a56,color:#503f22
  class W,C,V,AI,CONSENT,MANUAL,AX,AXA,AXS,SS,SSA,SSS,START,STREAM,WORK,REOPEN,READY,DECK,EMPTY screen
  class F,AF,PART,FAIL failure
```

Sources: [Tauri architecture](https://v2.tauri.app/concept/architecture/), [command permissions and capabilities](https://v2.tauri.app/security/capabilities/), [packaged helper binaries](https://v2.tauri.app/develop/sidecar/), [AXObserver](https://developer.apple.com/documentation/applicationservices/axobserver), [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit).
