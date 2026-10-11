# Nuxtr contributing guide

The goal is to offer the best developer experience for Nuxt developers within VSCode. We're open to any suggestions and ideas that can help us achieve that goal.

One of the main challenges is to keep the extension as lightweight as possible. We want to avoid adding too many features that can be easily achieved with other extensions. We want to avoid turning Nuxtr into an opinionated extension that tries to do everything. Any features we already have that can be labeled as "opinionated" should be optional and should be justified by a good reason why adding it will improve the developer experience.

As part of our roadmap we're exploring the options of building separate extensions that be used on top of Nuxtr VSCode or offering APIs that can be used by other extensions.

## Repo

Nuxtr VSCode contains a typical [VSCode extension structure](https://code.visualstudio.com/api/get-started/extension-anatomy) with [sidebar](./src/sideBar/) logic written using Vue 3 + TypeScript project and imported using [WebViews](https://code.visualstudio.com/api/extension-guides/webview).

We're using PNPM, so make sure you have it installed. Here's a [quick guide](https://pnpm.io/installation) on how to install it.

## PRs

### Discuss first

We're always happy to have contributors to the project. Nuxtr is actively developed and we want to avoid wasting time and effort. [Starting a discussion](https://github.com/nuxtrdev/nuxtr-vscode/discussions/new?category=ideas) first will help save time and effort for both maintainers and contributors.

### Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to automate the release process. Please follow the commit conventions to make sure your PRs are included in the next release.

## Development and validation

Use Node **24.20.0** (`.node-version`) and pnpm **12.10.1** (`packageManager`). Workspace settings and approved build scripts live in `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm validate
pnpm test:fixtures
pnpm dev
```

`pnpm validate` fails immediately on a failed check. It runs frozen installation, extension/sidebar typechecks, extension and Vue template/script lint, unit regressions, production build/VSIX asset checks, an isolated production-sidebar browser test, VS Code host scenarios and activation from an extracted VSIX. Install the browser once with `pnpm exec playwright install chromium` if Chrome is unavailable. `pnpm test:fixtures` creates isolated Nuxt 3 and 4 projects and verifies generated Tailwind, Pinia, composable, API, middleware and task code through prepare, typecheck and production builds; initial dependency installation needs network access. The fixtures also compile all H3 v1 server snippets and every applicable documented Nuxt API snippet, with Nuxt Image and required experimental flags enabled. See [the snippet catalogue](./docs/SNIPPETS.md) for supported contexts and update the offline API-coverage regressions when the official index changes.

The host suite covers empty/non-Nuxt windows, nested/multiple projects, Nuxt 2, Nuxt 3, compatibility v4, Nuxt 4 modern/legacy layouts and custom directories. Routine tests use offline package-manager and browser-host fixtures. `VSCODE_TEST_VERSION` chooses a downloaded VS Code release; `VSCODE_EXECUTABLE_PATH` overrides its executable. The browser blocks external requests. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` selects an installed Chromium executable.

`pnpm build` cleans `out/` once and builds the CommonJS extension and Vue sidebar. `pnpm dev` watches both without deleting sibling output. Generated bundles are ignored; packaged sidebar assets live under `out/sidebar`. Launch **Run Extension** in VS Code after building. Inspect a VSIX with local `pnpm package --out <path>`; publishing scripts are separate release actions.

## Architecture and documentation

- `src/core/`: independently tested project discovery, directory resolution, process/manager commands, catalog edits, templates, task and catalogue logic.
- `src/services/`: VS Code project scope and host-side process/network adapters.
- `src/commands/`: user actions and prompts; retain existing public command IDs.
- `src/sideBar/`: typed host requests and the Vue UI. Validate messages before commands or edits, retain restrictive CSP, and dispose listeners with their owner.

Start modified code files with a purpose comment and add JSDoc above named functions/methods explaining their behavior. Explain non-obvious constraints where they arise; avoid comments that merely repeat the code. JSON manifests remain valid JSON. `pnpm docs:check` audits comments on source files changed since the modernization baseline.

Keep substantial changes in separate branches from tested `main`. Use Conventional Commits, run the shared gate and applicable Nuxt fixtures, inspect the VSIX/diff, then merge locally with `git merge --no-ff` and rerun affected smoke tests. A failing check blocks merging. The local ignored `PLAN.md` and `PROGRESS.md` hold branch/evidence records and are excluded from VSIX packages. Pushes, upstream submissions, tagging and Marketplace publication require their own release workflow.

TypeScript is retained at **6.0.3** while vue-tsc's public compiler entrypoint and typescript-eslint peers do not support TypeScript 7. VS Code API declarations remain **1.140.0**, the latest published matching-generation types available during modernization, while the runtime minimum is 1.141.0. Revisit both with concrete peer/type/host evidence before upgrading.

Linux/Windows CI and macOS smoke jobs are configured for minimum/current stable VS Code. Local results do not replace CI results. Record WSL/remote verification only after it is actually performed; those environments remain pending in local modernization records.

Use `node scripts/ci-validate.cjs` to retain complete step logs, sidebar screenshots, the exact tested VSIX and its commit/checksum report under ignored `.artifacts/release-confidence/`. Use `node scripts/ci-validate.cjs fixtures` for generated-project evidence. CI retains separate artifacts for all six OS/editor targets, including failed-run diagnostics, and supports manual dispatch. Follow the [release validation checklist and mandatory WSL handoff](./docs/RELEASE_VALIDATION.md); local passing checks alone do not authorize a release.

The audit retains one low-severity [esbuild Windows development-server advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr). Its patched esbuild 0.28 release is outside tsup 8.5.1’s supported `^0.27.0` range. Revisit with a supported bundler upgrade and full host/package validation; avoid forcing the pre-1 breaking change through an override.

Feature regressions cover read-only diagnostics and explicit clipboard consent, Vue selection wrapping and single-step undo, idle project-terminal ownership/lifecycle, and cached module completion in literal Nuxt configuration. Use the feature checks in `docs/RELEASE_VALIDATION.md` for the installed candidate; previous platform CI does not validate a later feature commit. Definition-navigation work is outside this feature phase.
