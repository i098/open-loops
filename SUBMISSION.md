# Intelligence at Work Hackathon: submission

Fields follow section 5.1 of the official rules, in order. Copy each block into the form.

## (a) Team name

Open Loops

## (b) Team members

Nathan Zhao, i098 (GitHub [@i098](https://github.com/i098)). Edit before submitting.

## (c) Project description

Open Loops is a small desk buddy that finds the work people forgot to close: a laptop request that has sat in "awaiting approval" for 92 days after the laptop arrived, a launch brief where you are the last approver, a customer asking for a date nobody gave, an invoice about to pick up a late fee, a contractor whose warehouse access outlived the contract.

It reads those loops from a Snowflake view, has Claude turn each into one card (what it is, why it matters, a verbatim quote from the record), and offers two or three read/draft next steps. Swipe left to snooze, right to choose. You see the exact brief before anything leaves, and only an explicit Accept runs the Claude job. The result is a cited draft or summary. Nothing is sent, approved, paid or closed for you.

## (d) Value case

- **Metric it moves:** stale loops closed per week, counted only when the source system confirms the closure and the item was at least 30 days old at closure; second metric is time from "question raised" to "decision recorded".
- **Baseline:** in the seeded workspace, five loops are 4 to 92 days old with no owner action. In most service desks and AP queues, items past 30 days are closed by periodic manual sweeps, if at all.
- **Who pays:** the ops owner of the queue (IT service management, finance AP, security access reviews). Each loop type has a direct cost: a late fee on the Northwind invoice ($18,400 past due, fee after Oct 31), a duplicate laptop purchase, a live credential on a departed contractor (audit finding).
- **Rough worth:** if one manager clears 10 stale loops a week at 15 minutes saved each, that is 2.5 hours a week per manager before counting avoided fees and audit findings. A 200-manager org gets roughly 500 hours a week back.

## (e) Architecture summary

- **Snowflake SQL API v2** runs one fixed, parameter-bound read over `OPEN_LOOPS.PUBLIC.LOOP_EVIDENCE` (handles 202 polling and result partitions, fails closed on 401/403/429 and on schema drift). Auth is a programmatic access token held only by the local server.
- **Claude Messages API** (`claude-sonnet-5-5`) gets each loop's evidence and must call an `emit_card_pack` tool. The server rejects packs whose quote is not verbatim from a cited row or that cite unknown evidence IDs.
- Cards stream to the browser companion over Server-Sent Events as each validates, so the first card appears before the scan ends.
- Accepted jobs call Claude again with the exact reviewed brief. Results cite evidence inline as [1], [2].
- **Snowflake as memory:** every card pack and accepted job is appended to `OPEN_LOOPS.PUBLIC.LOOP_JOURNAL` (VARIANT detail) through the same SQL API, so the decision trail sits next to the data.
- Claude can also be routed through the Snowflake Cortex AI Gateway (Anthropic-compatible Messages API) by setting `ANTHROPIC_BASE_URL` and a PAT.
- Snowflake surfaces used: Snowsight (setup), SQL API, programmatic access tokens, authentication policy, tables with VARIANT.

Diagram and run steps: [README](README.md#what-it-does).

Verified live on Oct 23: the recorded run read 10 evidence rows from the hackathon Snowflake account over the SQL API, and every card pack, snooze and accepted job was written back to `LOOP_JOURNAL` (24 rows after two runs, 0 failed writes).

## (f) Build story

The companion UI, its interaction tests and the native Tauri plan were built before the event with Claude Code and Codex, under a CI gate (format, lint, 9 Playwright interaction tests, Sentrux structure check). At the hackathon, Claude Code (Opus) read the event rules and the technical resource guide, then wrote the live server, the Snowflake SQL API client, the Claude card-pack validator, contract tests for both APIs (including a mutation check that the verbatim-quote guard actually fails when removed), the Snowflake setup script and this write-up. The demo video was recorded headless by a record-demo recipe that waits for the real Claude result before it will publish a take.

## (g) Viability

Owner after today: the ops lead for one queue (IT requests is the easiest start, since "duplicate of a fulfilled request" is common and low risk). Next step: point `LOOP_EVIDENCE` at a real Jira Service Management or ServiceNow share in Snowflake, run it for one team for two weeks, and compare source-confirmed stale closures against the prior two weeks. After that, the native macOS build in the [implementation plan](docs/implementation-plan.md) (Tauri, Keychain, Snowflake OAuth) and authorized write-back with a second, re-checked approval.

## (h) Public GitHub repository

<https://github.com/i098/open-loops>

## (i) One-minute demo video

[docs/media/open-loops-live.mp4](https://github.com/i098/open-loops/raw/main/docs/media/open-loops-live.mp4)

## (j) Partner tools used

Snowflake (Snowsight, SQL API v2, programmatic access tokens, authentication policies), Anthropic Claude (Messages API, tool use; Claude Sonnet 5.5), Claude Code (build), Cerebral Valley (event).
