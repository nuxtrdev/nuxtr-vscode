## v0.2.2

[compare changes](https://github.com/nuxtrdev/nuxtr-vscode/compare/0.2.0...v0.2.2)

## Changelog

### Version 0.2.0
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


### ❤️ Contributors

- Adham Farrag [@adhamfarrag](https://github.com/adhamfarrag)
- Pooya Parsa [@pi0](http://github.com/pi0)

<br>

### Version 0.1.11

🩹 Fixes

- Removing Plugins watcher.

### Version 0.1.9

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

### Version 0.1.0

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

### Version 0.0.6

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

### Version 0.0.5

🩹 Fixes

- Activity Bar icon not showing on Linux.
- Windows performance issues.

<br>

### Version 0.0.4

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

### Version 0.0.3

📖 Documentation:

- Update README.md.

✨ Improvements

- Extension performance.

<br>

### Version 0.0.2

- 📖 DOCS: Update README.md.

<br>

### Version 0.0.1

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
