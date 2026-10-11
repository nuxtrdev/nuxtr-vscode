## Unreleased — modernization

- Label sidebar filters and show pointer cursors on enabled actions and links.

- Add consistent 12px padding around both sidebar views, keeping controls and module cards inset at narrow widths.

- Complete canonical module names in Nuxt configuration from cached/offline catalogue data, with tuple, duplicate and compatibility handling (#144).

- Add opt-in terminal reuse for confirmed idle Nuxtr terminals in the same project and working directory (#154).

- Wrap Vue template selections with Nuxt built-ins, preserving indentation and offering one undo for multiple selections (#134).

- Add read-only project health checks with a diagnostics preview and explicit clipboard copy.

- Complete Pinia and other successful command configuration while documentation notifications remain open; keep delayed documentation actions functional and separate browser errors from installation results.
- Open module/layer sidebar tabs on the first CodeLens click, including cold views and stale filters. Show one Nitro task palette entry and handle missing Explorer resources without `undefined.fsPath` errors.
- Execute offline package-manager launchers in paths containing spaces, including real Windows command shims in CI; cover cancellation, timeouts, failed installs and preserved configuration.
- Add manual CI dispatch and retain complete gate logs, actual editor/runtime identity, sidebar screenshots and the tested VSIX/checksum. Document issue regressions, installed-extension checks and mandatory WSL release sign-off.

- Fix sidebar Install clicks failing to send reactive module metadata; show recoverable installation errors and allow configuration to proceed without dismissing the success notification.

- Cover all Nuxt 4 API components, composables and utilities, preserve existing prefixes, link official docs, correct invalid signatures and guard newer APIs by project version.

- Add all 72 documented H3 v1 helpers as server-only Nitro snippets; correct cookie helper arguments and support custom server directories.

- Show project structure in the application-folder Explorer menu, and API/server-utility creation on resolved server folders, including custom/nested layouts.

- Raise the minimum VS Code version to 1.141.0; development/CI use Node 24.20.0 and pnpm 12.10.1.
- Upgrade stable Nuxt schema, Vue/Vite/Router, Tailwind, lint and packaging tooling. Retain TypeScript 6.0.3 until Vue/ESLint integrations support TypeScript 7.
- Fix empty-window activation, nested/multiple project selection, Nuxt 3/4 and custom directory handling, Bun lockfile/fallback detection, complete process results and pnpm catalog updates.
- Replace installed-manifest snippet mutation with owned dynamic providers; prevent boilerplate suggestions in imports. Remove the unrelated global log override.
- Separate module installation/config-edit errors, preserve config comments and default build-time modules to devDependencies. Add explicit Tailwind 4/Vite and legacy Tailwind 3 recipes.
- Protect generated files, honor indentation, normalize extensions and correct Pinia/server-middleware templates.
- Add optional component/composable/API templates, JS/TS scaffolds, composable filename prefixes, nested Nitro tasks with explicit experimental opt-in, release-note links and cached/offline module catalogues.
- Dispose listeners/providers, validate typed sidebar messages, restrict CSP and replace the feedback service with issue/discussion links. Move generated sidebar assets into ignored out/ output.
- Refresh compatible transitive dependencies and include Vue template/script lint in the merge gate.
- Add unit regressions, VS Code integration and packaged-extension tests, production-sidebar browser checks, generated Nuxt fixtures and Linux/Windows/macOS CI.

## v0.2.12

[compare changes](https://github.com/nuxtrdev/nuxtr-vscode/compare/0.2.10...v0.2.12)

### 🚀 Enhancements

- Handle file creation extensions ([b06bff8](https://github.com/nuxtrdev/nuxtr-vscode/commit/b06bff8))
- Custom project starters ([05abdbe](https://github.com/nuxtrdev/nuxtr-vscode/commit/05abdbe))
- Auto add default layout when creating layouts dir ([cf156f2](https://github.com/nuxtrdev/nuxtr-vscode/commit/cf156f2))
- Error.vue creation command ([701518e](https://github.com/nuxtrdev/nuxtr-vscode/commit/701518e))
- Project creation command ([8ad697f](https://github.com/nuxtrdev/nuxtr-vscode/commit/8ad697f))

### 🩹 Fixes

- Rename vueBaseFile to vueBase ([19bbc65](https://github.com/nuxtrdev/nuxtr-vscode/commit/19bbc65))
- **docs:** Project creation section. ([b41509a](https://github.com/nuxtrdev/nuxtr-vscode/commit/b41509a))
- User template branch ([83f5878](https://github.com/nuxtrdev/nuxtr-vscode/commit/83f5878))

### 🏡 Chore

- **release:** V 0.2.10 ([4b16aa4](https://github.com/nuxtrdev/nuxtr-vscode/commit/4b16aa4))
- Update dependencies ([66560ec](https://github.com/nuxtrdev/nuxtr-vscode/commit/66560ec))
- Refactor implementation ([26c0769](https://github.com/nuxtrdev/nuxtr-vscode/commit/26c0769))
- **release:** V 0.2.11 ([965407d](https://github.com/nuxtrdev/nuxtr-vscode/commit/965407d))

### ❤️ Contributors

- Adham Farrag <adham.farrag@hotmail.com>

## v0.2.7

[compare changes](https://github.com/nuxtrdev/nuxtr-vscode/compare/v0.2.6...v0.2.7)

### 🏡 Chore

- Update nuxt modules ([666e454](https://github.com/nuxtrdev/nuxtr-vscode/commit/666e454))
- Update dependencies ([23fbd01](https://github.com/nuxtrdev/nuxtr-vscode/commit/23fbd01))
- Update vscode engine version ([def7e7e](https://github.com/nuxtrdev/nuxtr-vscode/commit/def7e7e))

### ❤️ Contributors

- Adham Farrag <adham.farrag@hotmail.com>

## v0.2.6

[compare changes](https://github.com/nuxtrdev/nuxtr-vscode/compare/v0.2.5...v0.2.6)

### 🚀 Enhancements

- Typescript setup script snippet ([a5073ff](https://github.com/nuxtrdev/nuxtr-vscode/commit/a5073ff))
- Typescript setup script snippet ([e22240e](https://github.com/nuxtrdev/nuxtr-vscode/commit/e22240e))

### 💅 Refactors

- Integrations view & Modules APIs ([9df493f](https://github.com/nuxtrdev/nuxtr-vscode/commit/9df493f))
- Integrations view & Modules APIs ([924c3f4](https://github.com/nuxtrdev/nuxtr-vscode/commit/924c3f4))
- Nuxi Module command ([a5a166b](https://github.com/nuxtrdev/nuxtr-vscode/commit/a5a166b))
- Nuxi Module command <!--- ☝️ PR title should follow conventional commits (https://conventionalcommits.org) ([1d217cd](https://github.com/nuxtrdev/nuxtr-vscode/commit/1d217cd))
- Nuxi Module command ([f2fe32d](https://github.com/nuxtrdev/nuxtr-vscode/commit/f2fe32d))

### 🏡 Chore

- Monorepo configuration ([fe26eb2](https://github.com/nuxtrdev/nuxtr-vscode/commit/fe26eb2))
- Monorepo configuration ([d714af4](https://github.com/nuxtrdev/nuxtr-vscode/commit/d714af4))
- Dependencies security issues ([d11f362](https://github.com/nuxtrdev/nuxtr-vscode/commit/d11f362))

### ❤️ Contributors

- Adham Farrag <adham.farrag@hotmail.com>

## v0.2.5

[compare changes](https://github.com/nuxtrdev/nuxtr-vscode/compare/v0.2.4...v0.2.5)

### 🩹 Fixes

- Handle Nuxt devtools shipped native ([2642b99](https://github.com/nuxtrdev/nuxtr-vscode/commit/2642b99))
- Handle Nuxt Devtools native support ([cacc431](https://github.com/nuxtrdev/nuxtr-vscode/commit/cacc431))

### 🏡 Chore

- **docs:** Fix changelog template ([3ea388c](https://github.com/nuxtrdev/nuxtr-vscode/commit/3ea388c))

### ❤️ Contributors

- Adham Farrag <adham.farrag@hotmail.com>

## Version 0.2.4

### 🚀 Enhancements

- Pinia setup template ([3447255](https://github.com/nuxtrdev/nuxtr-vscode/commit/3447255))

### 🩹 Fixes

- Nuxt devtools toggle message ([6ad6693](https://github.com/nuxtrdev/nuxtr-vscode/commit/6ad6693))
- Vue templates spacing ([783e4fb](https://github.com/nuxtrdev/nuxtr-vscode/commit/783e4fb))

### 📖 Documentation

- Pinia default template ([48169fe](https://github.com/nuxtrdev/nuxtr-vscode/commit/48169fe))

### ❤️ Contributors

- Adham Farrag [@adhamfarrag](https://github.com/adhamfarrag)

<br>

## Version 0.2.3

### 🩹 Fixes

- DefaultPackageManager bun option ([59456cd](https://github.com/nuxtrdev/nuxtr-vscode/commit/59456cd))

### 📖 Documentation

- Changelog ([08dc8fe](https://github.com/nuxtrdev/nuxtr-vscode/commit/08dc8fe))

### ❤️ Contributors

- Adham Farrag [@adhamfarrag](https://github.com/adhamfarrag)

## Version 0.2.2

🩹 Fixes

- defaultPackageManager Bun option.

<br>

## Version 0.2.0

### 📦 New

- Vue Files Intellisense for NuxtLink and Static/Public directories.
- .nuxtrc Intellisense and syntax highlighting
- .nuxtignore Intellisense and syntax highlighting
- Controllers to enable/disable Snippets.
- Nitro Snippets.
- File creation commands and context menu items for Nitro.
- Bun Support.
- Pug Support.
- Nuxi CLI Integration.
- Nuxi Module Command.

### ✨ Improvements

- Refactoring context menu items naming.
- Hiding Commands when Nuxtr isn’t activated.
- Extension activation time reduction.

### 📖 Documentation

- IntelliSense and Auto Completion.
- Snippets Configuration.
- Nitro Snippets.


## ❤️ Contributors

- Adham Farrag [@adhamfarrag](https://github.com/adhamfarrag)
- Pooya Parsa [@pi0](http://github.com/pi0)

<br>

## Version 0.1.11

🩹 Fixes

- Removing Plugins watcher.

## Version 0.1.9

📦 New

- `serverDiv` support.
- [`$development`](https://nuxt.com/blog/v3-5#environment-config) support for Nuxt Devtools toggling.
- `nuxtr.vueFiles.script.defaultLanguage` setting.

✨ Improvements

- Basic Vue files template snippets.
- Monorepo support for actions/scripts.
- Highlighting outdated dependencies in the sidebar.
- Terminal icon/names.
- Performance improvements.

🩹 Fixes

- Menu items for Vue page/layout templates creation not showing on Windows.
- Integration views not detecting installed integrations.

<br>

### Version 0.1.8

✨ Improvements

- New Nuxt modules.
- Performance improvements.

<br>

### Version 0.1.7

✨ Improvements

- Activation time reduction.
- Nuxt Devtools detection.

 <br>

🩹 Fixes

- VSCode Activation errors when no Nuxt project is opened.
- Devtools detection errors.
- Codelens making `nuxt.config.ts` scroll when typing.
- Dependencies update errors when using pnpm.

<br>

💚 Thanks

- [Lucie](https://github.com/lihbr)

<br>

## Version 0.1.0

📦 New

- All Nuxt API (Components/Composables/Utils) snippets.
- Snippets section in Project View.
- Introducing File Templates for pages/layout:
  - File Templates section in Project View.
  - `nuxtr.vueFiles.pages.defaultTemplate` setting.
  - `nuxtr.vueFiles.layouts.defaultTemplate` setting.
  - `.page-template` and `.layout-template` extensions for ile templates.
- Actions to add (Modules/Plugins/ and Layers) in `nuxt.config.ts`.
- Auto adding plugins to `nuxt.config.ts` upon creating them.
- Layers detection and auto adding to `extends` field inside `nuxt.config.ts`.
- Linters Configuration (ESLint/Stylelint).
- `srcDir` and Monorepo Support.
  - `nuxtr.monorepoMode.DiretoryName` setting.
- Output channel.
- New filter for Ingration view (modules/layers/all).
- Outdated NPM dependencies update statusBar Icon.

✨ Improvements

- Dynamic Store naming.
- Nested API/Composables creation support.
- Project View Sidebar UI.
- Running Nuxtr on VSCode startup finishing.
- Handling deprected configuration for Devtools.
- Dependencies section UI in Project View.

🩹 Fixes

- vueFiles Templates: `lang=ts` in script tag.
- Including `nuxtr.vueFiles.firstTag` setting in `package.json`.

<br>

💚 Contributions

- [Anas Obaidat](https://github.com/anasobeidat)
- [Mohammad Nsairat](https://github.com/Nsairat)

<br>

## Version 0.0.6

📦 New

- Supporting Vuetify among the CSS frameworks.

✨ Improvements

- Commands prefixing.
- Information/Error messages & context menus.
- Handling no lockfiles or default package manager.
- Devtools installation for Linux/Windows.
- vueFiles templates.

🩹 Fixes

- Sidebar not working on Windows.

<br>

## Version 0.0.5

🩹 Fixes

- Activity Bar icon not showing on Linux.
- Windows performance issues.

<br>

## Version 0.0.4

📦 New

- Install and Configure most CSS frameworks with few steps.
  - TailwindCSS.
  - UnoCSS.
  - WindiCSS.
- Introducing `nuxtr.vueFiles.style.alwaysScoped` setting.
- Introducing `nuxtr.defaultPackageManager` setting.
- Create project directories Settings.

✨ Improvements

- Files creation is not relying on Nuxi CLI.
- Dependencies card in the sidebar.
- Grouping extension settings.

🩹 Fixes

- Devtools installation error on Windows & Linux.
- Activity Bar icon not showing on Linux.

<br>

## Version 0.0.3

📖 Documentation:

- Update README.md.

✨ Improvements

- Extension performance.

<br>

## Version 0.0.2

- 📖 DOCS: Update README.md.

<br>

## Version 0.0.1

📦 New

- Create project directories.
- Create files.
- Open Nuxt.js Docs.
- Installing dependencies.
- Run scripts from the VSCode command palette or sidebar.
- Toggle Devtools from your status bar.
- Install, remove and update project dependencies.
- Search and install modules.

<br>
