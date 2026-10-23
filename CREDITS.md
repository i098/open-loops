# Credits and third-party terms

Open Loops uses the projects listed below. Their licenses and terms remain separate from this repository's unresolved project license.

## Preview and tooling

- [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/) provide preview styling.
- [Mermaid](https://mermaid.js.org/) renders the architecture diagrams.
- [Playwright](https://playwright.dev/) runs browser interaction tests.
- ESLint, Prettier, Stylelint, Markdownlint and YAML tooling are pinned in the repository's [package.json](https://github.com/i098/open-loops/blob/main/package.json) and [lockfile](https://github.com/i098/open-loops/blob/main/package-lock.json).
- [Sentrux](https://github.com/sentrux/sentrux) performs the structural quality check; [CI.md](docs/CI.md) records the pinned binary and grammar verification.

The preview currently fetches some style/diagram assets from a CDN. The native plan requires reviewed local assets before native packaging.

## Motion, art and source material

Motion references include [Transitions.dev](https://transitions.dev/). Its custom snippet terms are described in [motion provenance](docs/motion.md#4-sources-and-license); do not assume these snippets are MIT-licensed or may be redistributed as a template library.

Source and sprite hashes are recorded in [snapshot.json](docs/verification/snapshot.json). Confirm the publication and redistribution rights for project-specific artwork and imported source material before selecting a project license; that review is **TBD**.

## Planned native dependencies

The [implementation contract](docs/implementation-plan.md) names Tauri, Rust, SQLite, Snowflake and Anthropic. This is a plan, not a claim those integrations are delivered. Review each dependency's license, service terms and credential/data requirements when implementing it.
