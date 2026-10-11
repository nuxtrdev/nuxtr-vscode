<br />

<div align="center">
    <img src="https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/logo.png" alt="Logo" width="80" height="80">
    <h3 align="center">Nuxtr VSCode</h3>
    <p align="center">An extension offering commands and tools <br /> to make your experience with Nuxt more pleasant!</p>
    <div align="center">
        <a href="https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxtr-vscode" target="_blank"><img src="https://img.shields.io/visual-studio-marketplace/v/Nuxtr.nuxtr-vscode.svg?color=blue&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
        <a href="https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxtr-vscode" target="_blank"><img src="https://img.shields.io/visual-studio-marketplace/i/Nuxtr.nuxtr-vscode?color=blue&label=Installs&logo=visual-studio-code" alt="Visual Studio Marketplace Installs" /></a>
    </div>
    <br>
    <div align="center">
        <a target="_blank" href="https://github.com/nuxtrdev/nuxtr-vscode/issues/new?assignees=&labels=bug%2Ctriage&projects=&template=issue.yaml&title=%5BBug%5D%3A+"><strong>Report Bug</strong> »</a>
        ·
        <a target="_blank" href="https://github.com/nuxtrdev/nuxtr-vscode/discussions/new/choose"><strong>Share Idea/feedback</strong> »</a>
    </div>
</div>


<br>

### What does Nuxtr do?

- [Getting Started](#getting-started)
- [Project Creation](#project-creation)
- [Directory and File Creation](#directory-and-file-creation)
- [Dependencies Management](#dependencies-management)
- [IntelliSense and Auto Completion](#intellisense-and-auto-completion)
- [Nuxi CLI Integration](#nuxi-cli-integration)
- [Nuxt, Nitro and Custom Snippets](#nuxt-nitro-and-custom-snippets)
- [Personalized File Templates](#personalized-file-templates)
- [Support for `srcDir`, `serverDir`, and Monorepo Projects](#support-for-srcdir-serverdir-and-monorepo-projects)
- [Execute Scripts with Ease](#execute-scripts-with-ease)
- [Optional Terminal Reuse](#optional-terminal-reuse)
- [Toggle Nuxt Devtools from your status bar](#toggle-nuxt-devtools-from-your-status-bar)
- [Search and install Nuxt integrations](#search-and-install-nuxt-integrations)
- [Install & Configure UI Libraries, CSS frameworks, and Linters](#install--configure-ui-libraries-css-frameworks-and-linters)
- [Project Health and Diagnostics](#project-health-and-diagnostics)
- [Wrap Selections in Nuxt Components](#wrap-selections-in-nuxt-components)
- [Contributing](#contributing)

<br>
<br>

### Getting Started

Nuxtr requires **VS Code 1.141.0 or newer**. Nuxt 3 and 4 are actively supported; existing Nuxt 2 workflows are retained where practical.

1. Install [Nuxtr from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxtr-vscode).
2. Open your Nuxt project and select the Nuxtr icon in the Activity Bar to access project tools and modules.
3. Open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux) and search for **Nuxtr**.

Working in a monorepo? Run **Nuxtr: Select Nuxt Project** to choose an application. To try changes from this checkout, follow the [local development instructions](#contributing) to build and install a VSIX.

<br>
<br>

### Project Creation

Run **Nuxtr: Create new Nuxt Project** to create a project, including from an empty VS Code window. Choose a starter from [Nuxt Starters](https://nuxt.new), or add your own in `settings.json`:

```jsonc
{
    "nuxtr.projectTemplates": [
        {
            "name": "Vitesse",
            "description": "Vitesse for Nuxt 3 🏔💚⚡️",
            "repoURL": "https://github.com/antfu/vitesse-nuxt3",
            "branch": "main" // Optional
        }
    ]
}
```

<br>

### Directory and File Creation

Generate pages, layouts, components, composables, plugins, middleware, utilities, stores and Nitro server files from the Command Palette or Explorer context menu. Nuxtr also creates special files such as [`.nuxtignore`](https://nuxt.com/docs/guide/directory-structure/nuxtignore), [`.nuxtrc`](https://nuxt.com/docs/api/configuration/nuxt-config), and [`app.config.ts`](https://nuxt.com/docs/guide/directory-structure/app-config).

Search for **Nuxtr: Create...** to create individual files. To scaffold directories, right-click the project root or application folder (`app/` in a modern Nuxt 4 layout) and select **Nuxtr: Nuxt project structure...**. Right-click the resolved server folder to create a Nitro API or utility under `server/api` or `server/utils`.

File creation respects your editor's indentation settings and protects existing files. Customize Vue files and choose a Pinia store style in `settings.json`:

```json
{
    "nuxtr.vueFiles.template.defaultLanguage": "html",
    "nuxtr.vueFiles.firstTag": "template",
    "nuxtr.vueFiles.script.type": "setup",
    "nuxtr.vueFiles.script.defaultLanguage": "ts",
    "nuxtr.vueFiles.style.addStyleTag": true,
    "nuxtr.vueFiles.style.alwaysScoped": true,
    "nuxtr.vueFiles.style.defaultLanguage": "scss",
    "nuxtr.piniaFiles.defaultTemplate": "options",
    "nuxtr.openItemsAfterCreation": true
}
```

**JavaScript or TypeScript**: Non-Vue scaffolds use TypeScript by default. You can choose JavaScript and optionally generate `use`-prefixed composable filenames, such as `useCounter.js`:

```json
{
    "nuxtr.scaffolding.defaultLanguage": "js",
    "nuxtr.scaffolding.composableUsePrefix": true
}
```

**Pinia stores**: Creating a store in Nuxt 3 or 4 also installs `@pinia/nuxt` when needed and adds it to your Nuxt configuration. Choose `setup` or `options` with `nuxtr.piniaFiles.defaultTemplate`.

**Nitro tasks**: Run **Nuxtr: Create Nitro Task** to create a task in the resolved `server/tasks` directory. Nested names such as `db:migrate` create nested files. Use **Nuxtr: Enable Experimental Nitro Tasks** when you want to enable tasks explicitly. See the [Nitro 2 task guide](https://v2.nitro.build/guide/tasks); task templates follow the installed Nitro generation.

![Nuxt Project Creation](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/file_creation.gif)

<br>
<br>

### Dependencies Management

**Package Manager Detection**: Nuxtr detects npm, pnpm, Yarn and Bun from the project's lockfile, including both `bun.lock` and `bun.lockb`. Set a fallback for projects without a lockfile:

```json
{
    "nuxtr.defaultPackageManager": "pnpm"
}
```

**Dependencies Management**: Use the sidebar's Project view to remove dependencies, upgrade them, or select a specific version. pnpm default and named workspace catalogs are supported, and updating a catalog-managed dependency preserves its catalog reference.

**Release Notes**: Dependency updates include release-note links when repository metadata is available, with an npm package-page fallback.

**Status Bar Icon**: Check outdated dependencies and start an update directly from the status bar.

<br>

![Nuxt Dependencies](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/dependencies.gif)

<br>
<br>

### IntelliSense and Auto Completion

Nuxtr adds path completion for [NuxtLink](https://nuxt.com/docs/api/components/nuxt-link#internal-routing) destinations and media in your public or static directory, plus completion for [`.nuxtignore`](https://nuxt.com/docs/guide/directory-structure/nuxtignore) and [`.nuxtrc`](https://nuxt.com/docs/guide/directory-structure/nuxtrc).

**Module-name completion**: Inside the `modules` array of your Nuxt configuration, start typing a package name and trigger suggestions with `Ctrl+Space`. Completion uses the cached or bundled module catalogue, works offline, and supports tuple-style entries. Already configured modules, layers and known incompatible Nuxt versions are excluded. Use **Refresh catalogue** in the sidebar to update the shared catalogue.

```ts
export default defineNuxtConfig({
    modules: [
        '@nuxt/' // Trigger completion here
    ]
})
```

Module completion supports literal arrays in `nuxt.config.ts`, `.js`, `.mjs`, `.cjs` and `.config/nuxt.ts` using a default export. Computed configurations and CommonJS assignments need manual entries.

You can enable or disable each provider in `settings.json`:

```json
{
    "nuxtr.intellisense.nuxtrc": true,
    "nuxtr.intellisense.vueFiles": true,
    "nuxtr.intellisense.nuxtignore": true,
    "nuxtr.intellisense.nuxtModules": true
}
```

![IntelliSense](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/intellisense.gif)

<br>
<br>

### Nuxi CLI Integration

Run the project's installed [Nuxt CLI](https://github.com/nuxt/cli) directly from VS Code. Search for **Nuxtr: Run Nuxi** in the Command Palette for common actions such as dev, build, generate and info, or select **Nuxtr: Nuxi CLI** to browse the supported commands.

Commands run in a terminal for the selected project using its package manager. You can also add modules through the CLI without having to remember their exact package names.

![Nuxi CLI](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/nuxi.gif)

<br>
<br>

### Nuxt, Nitro and Custom Snippets

**Nuxt Snippets**: Type a component, composable or utility name and select the Nuxtr suggestion. The catalogue covers the Nuxt 4 API components, composables and utilities, including editable placeholders and documentation links. Use `vueBase` or `vueBaseLayout` for boilerplate based on your Vue file settings.

**Nitro and H3 Snippets**: In JavaScript or TypeScript files under the resolved server directory, type a server helper such as `readBody`, or its explicit alias `h3ReadBody`. H3 v1 snippets include request, response and advanced utilities for Nitro 2 projects, including custom server directories. See the [Nitro documentation](https://v2.nitro.build) and [H3 v1 documentation](https://v1.h3.dev).

Both snippet groups are enabled by default. Changes to their settings apply immediately:

```json
{
    "nuxtr.snippets.nuxt": true,
    "nuxtr.snippets.nitro": true
}
```

**Custom Snippets**: Create, edit and delete your own snippets from the sidebar.

See the [complete snippet catalogue](./docs/SNIPPETS.md) for prefixes, supported contexts, API requirements and local testing instructions.

<br>
<br>

### Personalized File Templates

Save reusable templates for pages, layouts, components, composables and Nitro APIs in your project's `.vscode` directory. Create page and layout templates from existing files through the Explorer context menu, or manage templates in the sidebar.

| File type | Template extension | Default template setting |
|---|---|---|
| Page | `.page-template` | `nuxtr.vueFiles.pages.defaultTemplate` |
| Layout | `.layout-template` | `nuxtr.vueFiles.layouts.defaultTemplate` |
| Component | `.component-template` | `nuxtr.fileTemplates.components.defaultTemplate` |
| Composable | `.composable-template` | `nuxtr.fileTemplates.composables.defaultTemplate` |
| Nitro API | `.api-template` | `nuxtr.fileTemplates.apis.defaultTemplate` |

Choose defaults in `settings.json`, using the template's filename:

```json
{
    "nuxtr.vueFiles.pages.defaultTemplate": "default.page-template",
    "nuxtr.vueFiles.layouts.defaultTemplate": "default.layout-template",
    "nuxtr.fileTemplates.components.defaultTemplate": "default.component-template",
    "nuxtr.fileTemplates.composables.defaultTemplate": "default.composable-template",
    "nuxtr.fileTemplates.apis.defaultTemplate": "default.api-template"
}
```

Component, composable and API defaults are optional; leave them empty to use the built-in scaffold.

![File Templates](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/file_templates.gif)

<br>
<br>

### Support for `srcDir`, `serverDir`, and Monorepo Projects

Nuxtr discovers nested Nuxt applications and projects across multiple workspace folders. Run **Nuxtr: Select Nuxt Project** to select an application when needed. Explorer actions and completions use the project containing the selected file or folder.

Nuxt 3 and 4 layouts are supported, including Nuxt 3's compatibility setting, Nuxt 4's default `app/` layout and legacy layouts. Application files and root-level server, public and shared directories are resolved separately.

Set custom directories in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
    srcDir: 'src',
    serverDir: 'server'
})
```

For an explicit monorepo override, set the project's relative path in `.vscode/settings.json`:

```json
{
    "nuxtr.monorepoMode.DirectoryName": "apps/web"
}
```

If computed or inherited configuration prevents safe directory resolution, Nuxtr shows guidance to use an explicit Explorer destination or make the directory settings explicit before creating files.

<br>
<br>

### Execute Scripts with Ease

Run common Nuxt commands from the Command Palette, or select a script from `package.json` in the sidebar's Project view. Nuxtr uses the selected project's package manager and working directory. Terminal commands appear in the integrated terminal; background command output is available in the Nuxtr Output channel.

![Nuxt Scripts](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/scripts.png)

<br>

### Optional Terminal Reuse

Prefer fewer terminals? Enable reuse in `settings.json`:

```json
{
    "nuxtr.terminal.reuse": true
}
```

Reuse is off by default. With [VS Code shell integration](https://code.visualstudio.com/docs/terminal/shell-integration), Nuxtr can reuse its own terminal after a command finishes, provided it belongs to the same project and working directory. Busy dev servers, unrelated terminals and shells without reliable integration get a new terminal.

<br>
<br>

### Toggle Nuxt Devtools from your status bar

Toggle [Nuxt DevTools](https://devtools.nuxtjs.org/) directly from the VS Code status bar. Changes made in `nuxt.config.ts` are detected and the toggle stays in sync.

![Nuxt Devtools](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/devtools.gif)

<br>
<br>

### Search and install Nuxt integrations

Browse modules and layers from the Nuxtr sidebar, with search and labeled filters for integration type, Nuxt version, module source and category.

Select **Install** to add a module with your project's package manager and update `nuxt.config`. Modules use development dependencies by default unless their metadata requires runtime installation. Open the module's documentation with **Docs**. Installation and configuration failures are reported separately, so you can see which step needs attention.

The catalogue uses the [official Nuxt modules feed](https://cdn.jsdelivr.net/npm/@nuxt/modules@latest/modules.json). Select **Refresh catalogue** to fetch the latest list. Cached results and a bundled snapshot keep browsing available offline; installing packages still requires access to your package registry.

![Nuxt Modules](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/modules.gif)

<br>
<br>

### Install & Configure UI Libraries, CSS frameworks, and Linters

- UI Libraries: [Vuetify](https://nuxt.com/modules/vuetify-nuxt-module).
- CSS Frameworks: Tailwind CSS with a choice of Tailwind 4/Vite or the legacy Tailwind 3/Nuxt module recipe, and [UnoCSS](https://unocss.dev/integrations/nuxt).
- Linters: the official [Nuxt ESLint module](https://eslint.nuxt.com) and [Stylelint](https://nuxt.com/modules/stylelint).

Use **Nuxtr: Configure CSS Frameworks** or **Nuxtr: Configure Linters** from the Command Palette. The Tailwind recipes install matching packages and generate the CSS and configuration for the selected version.

<br>

![Nuxt Modules](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/.github/media/css_frameworks.gif)

<br>
<br>

### Project Health and Diagnostics

Run **Nuxtr: Project Health Check and Diagnostics** to check the installed Nuxt version, generated types, package-manager availability, catalog references and directory resolution. Findings include suggested next steps without changing your project.

The report opens in the editor for review. Select **Copy diagnostics** in the notification when you want to share it in an issue. Nothing is sent automatically; the report omits source files, environment values and absolute paths.

<br>
<br>

### Wrap Selections in Nuxt Components

Select content in a Vue template and run **Nuxtr: Wrap Selection in Nuxt Component**, or use the editor context menu. Choose `ClientOnly`, `NuxtLink`, `DevOnly`, `NuxtLayout` or `NuxtErrorBoundary`.

Multiple selections are supported and undo together. Wrapping respects your editor's indentation and line endings. `NuxtLink` starts with `to="/"`, ready for you to edit. This action supports inline HTML templates; script, style, external-template and Pug blocks are excluded.

<br>
<br>

### Contributing

We always welcome new ideas! 💚 <br>
If you have an idea, [open a discussion](https://github.com/nuxtrdev/nuxtr-vscode/discussions/new/choose) first and let's talk about it!

To work on the extension, use **Node 24.20.0** and **pnpm 12.10.1**:

```sh
pnpm install --frozen-lockfile
pnpm build
```

Open the repository in VS Code and press **F5** with the **Run Extension** launch configuration. In the Extension Development Host, open a disposable Nuxt app and try the commands and sidebar. The launch task watches both the extension and Vue sidebar; reload the host after extension code changes.

To test an installed build:

```sh
pnpm package --out nuxtr-local.vsix
code --install-extension nuxtr-local.vsix --force
```

Reload VS Code, open your Nuxt app, and follow the [manual release checklist](./docs/RELEASE_VALIDATION.md). Run `pnpm validate` for the shared automated checks and `pnpm test:fixtures` for generated-file checks in Nuxt 3 and 4 projects.

See the [contributor guide](./CONTRIBUTING.md) for the repository layout, development workflow, test requirements and code documentation conventions.

<br>

### Acknowledgements

Nuxtr relies on the following projects/repositories:

- [Nuxt Modules](https://github.com/nuxt/modules)
- [Nuxt Assets](https://github.com/nuxt/assets)
- [Tabler Icons](https://tablericons.com/)

<br>

### License

[MIT](https://raw.githubusercontent.com/nuxtrdev/nuxtr-vscode/main/LICENSE) License © 2023 with 💚
