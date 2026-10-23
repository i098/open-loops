# Changelog

No release tags or native installers are documented yet. Entries below describe repository work, not a shipped native product.

## Unreleased

### Added

- Live mode (`npm run live`): Snowflake SQL API v2 evidence read with bound parameters, 202 polling and partitions; Claude card packs via a strict tool schema with verbatim-quote validation, streamed over SSE; accepted Claude read/draft jobs; card, job and snooze events journaled to Snowflake `LOOP_JOURNAL`.
- `snowflake/setup.sql`, seeded demo evidence, `.env.example`, contract tests for both APIs, and a record-demo recipe with the recorded one-minute clip.
- GPL-3.0-or-later license and hackathon submission write-up.
- Browser companion and My day previews with synthetic records and explicit manual prompt export.
- Real browser interaction tests, policy/import tests, strict Sentrux checks and gated preview bundles.
- A Tauri/macOS implementation contract for Snowflake SQL API, Anthropic Messages API, SQLite, Keychain and native acceptance gates.
- Contribution, support, security and conduct guidance, issue/PR templates, and an OSS-readiness checklist.

### Fixed

- Buddy drop retention and unnecessary click motion.
- Native click suppression after a horizontal touch swipe in Chromium.

### Documentation

- Clarified prototype versus native functionality and licensing/security decisions still marked TBD.
- Simplified the README and included supporting documents in preview bundles.
