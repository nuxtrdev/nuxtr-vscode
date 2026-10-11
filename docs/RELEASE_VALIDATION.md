# Release validation

The candidate is **not release-ready** until all six hosted CI jobs and the mandatory WSL walkthrough pass against the same candidate commit. Local macOS results cover this machine only. Publishing commits to the fork for CI, upstream submissions and Marketplace publication are separate actions.

## Candidate and automated evidence

Use Node 24.20.0 and pnpm 12.10.1. From a clean candidate checkout, run:

```sh
pnpm install --frozen-lockfile
node scripts/ci-validate.cjs
node scripts/ci-validate.cjs fixtures
```

Evidence is saved under ignored `.artifacts/release-confidence/`: `validation.json` records the commit, dirty-tree state, platform, runtime, result and tested VSIX SHA-256; numbered logs retain complete stdout/stderr for each gate. Host logs include `NUXTR_SMOKE_ENV` with the actual editor version. `fixtures.json` and `fixtures.log` record generated-project checks. The package and light/dark sidebar screenshots are retained in the same directory and excluded from the VSIX. A dirty-tree run is branch-validation evidence, not final candidate evidence.

The CI workflow supports push/PR validation and [manual dispatch](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). Each job uploads a separate `release-confidence-<os>-<vscode>` artifact for 14 days, including diagnostics on failure and the VSIX if produced. Download evidence before it expires. Linux uses Xvfb. The minimum-editor Linux job also builds the real Nuxt fixtures. Compare every job's commit to the candidate and check actual editor versions in host logs; `stable` is a moving target.

| Platform | Minimum VS Code 1.141.0 | Current stable |
|---|---|---|
| GitHub Ubuntu | Pending hosted execution | Pending hosted execution |
| GitHub Windows | Pending hosted execution | Pending hosted execution |
| GitHub macOS | Pending hosted execution | Pending hosted execution |

Local macOS validation currently passes 146 unit tests, ten development-host scenarios, four extracted-VSIX host scenarios and production-sidebar browser checks. Host tests use disposable offline projects and a minimal Vue language fixture; they do not replace a hands-on installed-extension walkthrough with Vue - Official. Local candidate identity, checksum and subsequent platform/tester results belong in ignored `PROGRESS.md` and `.artifacts/release-confidence/candidate.json`; this guide deliberately contains no self-referencing commit hash.

## Installed VSIX checklist on macOS

Install the retained `nuxtr-validation.vsix` using **Extensions: Install from VSIX**, then reload VS Code. Use a disposable editor profile with Vue - Official enabled and disposable Nuxt projects; remove an older Nuxtr installation from that profile. Confirm the installed extension/version and compare `shasum -a 256 <vsix-path>` with the evidence. Capture results, errors and screenshots, including failures, before cleaning up.

- [ ] **Empty window:** run **Nuxtr: Create new Nuxt Project**, complete creation in a temporary directory, open it and prepare/build it. Also open a non-Nuxt folder and confirm project-only actions stay hidden.
- [ ] **Project selection:** test Nuxt 3, Nuxt 3 with `future.compatibilityVersion: 4`, Nuxt 4 modern/legacy layouts and explicit `srcDir`, `serverDir` and `dir` settings. Put two apps in one workspace, switch active files and use **Nuxtr: Select Nuxt Project**; confirm edits and commands affect the selected app.
- [ ] **Cold navigation:** close/hide the sidebar, click **Add new module** above `modules` in `nuxt.config.ts` once and confirm the module list appears. Repeat for layers; navigate from Project with stale search/filter settings and confirm the requested list appears on the first click.
- [ ] **Actual module installation:** install a compatible module (for example `nuxt-aos`) through its sidebar card. Confirm the dependency, lockfile and canonical `modules` entry, preserving comments and other options. Check pending/success states and the Docs action. In a fresh disposable project, force an install failure using an unreachable registry, verify config is unchanged, restore the registry and retry. Record the observed package-manager error.
- [ ] **Pinia toast:** start with neither `pinia` nor `@pinia/nuxt` installed, create a store from the palette and leave the success toast open. Confirm configuration receives `@pinia/nuxt` and the command finishes without dismissing the toast; then use **Open documentation**. Prepare/typecheck/build the project.
- [ ] **Explorer and tasks:** right-click the resolved application folder for project structure, and server folder for API/server utility actions. Create a nested Nitro task through the single palette entry and Explorer action; explicitly enable tasks if required. Verify custom paths and that repeating file creation protects existing content.
- [ ] **Formatting and snippets:** test tabs and spaces, names with an existing extension, JS/TS scaffolds, Nuxt/Vue snippets and Nitro/H3 helpers inside the resolved server directory. Toggle both snippet settings off/on without reinstalling; confirm boilerplate suggestions are suppressed inside imports.
- [ ] **Offline catalogue:** refresh once online, disconnect, reload the sidebar and refresh again. Confirm cached/snapshot modules stay available and a failed refresh settles loading. Restore connectivity and check keyboard navigation and both themes.

- [ ] **Health diagnostics:** in Nuxt 3/4 and a nested application, run **Project Health Check and Diagnostics** before and after installing dependencies/preparing types. Test unresolved catalogs and computed/layer directories. Confirm no files change, review the report, leave the notification open, then explicitly copy. Check the clipboard omits source contents, environment values and absolute paths.
- [ ] **Component wrapping:** select inline and multiline Vue template content, including multiple selections, tabs/spaces and CRLF. Wrap with `ClientOnly`, `NuxtLink` (edit `to`), `DevOnly`, `NuxtLayout` and `NuxtErrorBoundary`. Undo once, cancel the picker, and change the document while it is open. Script/style/Pug/external template selections must not be changed.
- [ ] **Terminal reuse:** enable `nuxtr.terminal.reuse`, run a short Nuxtr CLI command twice after it finishes, then test a running dev server. Only confirmed idle owned terminals with matching project and reported cwd may reuse. Test manual commands, changing cwd, missing shell integration, closed terminals, two applications sharing a workspace, and disabling reuse. No running task may be interrupted.
- [ ] **Module completion:** use Ctrl+Space in plain/quoted/tuple-first `modules` entries, including `.config/nuxt.ts` and JS configs. Confirm canonical names, existing-module exclusion and Nuxt compatibility. CSS, nested module properties, comments and tuple options must not receive suggestions. Toggle `nuxtr.intellisense.nuxtModules` immediately, refresh the sidebar catalogue, disconnect and confirm completion still works without requests.

For package commands, also exercise npm, pnpm, Yarn and both Bun lockfile variants. Use a pnpm workspace path with spaces, default/named catalogs and unresolved/non-semver declarations; failed/cancelled operations must leave configuration intact. Automated launcher tests execute real `.cmd` fixtures on Windows, rather than merely comparing argument arrays.

## Mandatory WSL sign-off

A Windows tester must open disposable Nuxt 3 and Nuxt 4 projects in the **WSL extension host**, following [VS Code's WSL setup](https://code.visualstudio.com/docs/remote/wsl). Confirm the remote indicator and install Nuxtr and Vue - Official into **WSL: <distribution>**. An installation only in local Windows VS Code does not qualify. Use the retained candidate VSIX, verify its SHA-256 inside WSL with `sha256sum`, and record which platform job produced it.

- [ ] Verify Nuxt/Vue snippet resources, `vueBase`, a component/composable snippet and dynamic Nuxt snippet toggles in both projects; check import-line suppression.
- [ ] Verify Nitro/H3 server snippets and Nitro toggles in default and custom server directories, and absence of H3 suggestions outside server context.
- [ ] Open the sidebar from a cold state; confirm its assets load, first-click module navigation works, actual installation edits the correct project and offline catalogue fallback remains usable.
- [ ] Run project selection/creation, application/server Explorer scaffolding and Nitro task commands. Confirm Linux paths, indentation and existing-file protection; prepare/typecheck/build the generated project files.
- [ ] Repeat the Pinia creation with its documentation toast left open. Record outcomes and attach relevant host/output logs and screenshots.

Record Windows build, WSL version, distribution/kernel, VS Code version, Node/package-manager versions, exact Nuxt/Nitro versions, project layout, candidate commit/VSIX hash, extension-host location, test date, tester and each result. Record failures as failures. Native Linux CI and macOS containers do not replace WSL evidence. Release remains blocked until the tester's record passes review.

## Upstream issue regressions

These thirteen planned issues have local implementation and regression coverage. This table reports fork evidence; it does not close issues upstream. All rows still require the relevant hosted CI results, and remote behavior requires the WSL sign-off above.

| Issue | Local regression evidence | Remaining release evidence |
|---|---|---|
| [#194](https://github.com/nuxtrdev/nuxtr-vscode/issues/194) Empty-window commands | Development/extracted-VSIX `empty` host scenarios | Complete interactive project creation |
| [#49](https://github.com/nuxtrdev/nuxtr-vscode/issues/49) Nested/multiple projects | `project.test.ts`; `nested` / `two-projects` hosts | Installed-profile project/manager selection |
| [#150](https://github.com/nuxtrdev/nuxtr-vscode/issues/150) Nuxt directories | `directories.test.ts`; modern/legacy/custom/compat4 hosts | Hands-on creation/navigation in each layout |
| [#177](https://github.com/nuxtrdev/nuxtr-vscode/issues/177) Package managers | `managers.test.ts`, `process.test.ts`, `package-manager-process.test.ts` | Windows `.cmd` execution in CI; actual Bun walkthrough |
| [#196](https://github.com/nuxtrdev/nuxtr-vscode/issues/196) pnpm catalogs | `catalogs.test.ts`: YAML/comments, named/default references, rollback and concurrent edits | Installed-profile catalog update/loading flow |
| [#182](https://github.com/nuxtrdev/nuxtr-vscode/issues/182) Snippet resources | `snippets.test.ts`; packaged asset/toggle host checks | Installed Vue - Official walkthrough |
| [#183](https://github.com/nuxtrdev/nuxtr-vscode/issues/183) WSL snippets | Extension-resource providers and packaged host checks | **Mandatory actual WSL reproduction/sign-off** |
| [#188](https://github.com/nuxtrdev/nuxtr-vscode/issues/188) Import suggestions | `snippets.test.ts`; host import-line checks | Installed-profile import suppression |
| [#189](https://github.com/nuxtrdev/nuxtr-vscode/issues/189) Module configuration | `modules.test.ts`; production sidebar install/retry checks; launcher config preservation | Actual install, config-edit failure and retry |
| [#130](https://github.com/nuxtrdev/nuxtr-vscode/issues/130) Module dependency type | `modules.test.ts`: development default / explicit runtime metadata | Actual manifest/lockfile inspection |
| [#179](https://github.com/nuxtrdev/nuxtr-vscode/issues/179) Tailwind recipes | `tailwind.test.ts`; Nuxt 3/Tailwind 3 and Nuxt 4/Tailwind 4 build fixtures | Installed-profile recipe selection |
| [#172](https://github.com/nuxtrdev/nuxtr-vscode/issues/172) Generated files | `generated.test.ts`, `templates.test.ts`; JS/TS/Pinia/middleware build fixtures | Tabs/spaces and existing-file walkthrough |
| [#191](https://github.com/nuxtrdev/nuxtr-vscode/issues/191) Log language conflict | Manifest/package inspection and host ordinary-log language assertion | Installed-profile ordinary log highlighting |

Recent follow-ups have additional regressions in `sidebar-bridge.test.ts`, `sidebar-navigation.test.ts`, `task-commands.test.ts`, `explorer.test.ts` and `installation-progress.test.ts`. The last suite checks the actual Pinia command with a pending documentation toast, delayed documentation action, dismissal and browser failures. New CI-evidence tests also verify retained failed-command diagnostics.

## Audit and compatibility limits

Audit refreshed **2026-10-10** with `pnpm audit --json`: **0 critical, 0 high, 0 moderate, 1 low**. The retained [esbuild Windows development-server advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) affects resolved esbuild 0.27.7; its fix starts at 0.28.1, outside tsup 8.5.1's `^0.27.0` range. Do not force this pre-1 breaking upgrade through an override. Revisit through a supported tooling upgrade and full validation. Raw audit evidence is retained alongside the candidate artifacts; no dependencies changed in this phase.

- Nuxt 3.21.11 and Nuxt 4.6.1 fixture builds are covered. This does not establish every Nuxt 3/4 release or third-party module combination.
- Nuxt 2 activation is covered; Nuxt 2 generated-project builds remain unverified.
- Real Nuxt fixtures currently use Nitro 2.13.4/H3 v1. Nitro 3 task templates have unit coverage, but Nitro 3 runtime task behavior and H3 v2 compatibility remain unverified.
- TypeScript 7 remains deferred after compiler-entrypoint/ESLint peer failures in the earlier migration. Installed TypeScript is 6.0.3. VS Code API declarations remain 1.140.0 under the 1.141.0 runtime minimum; validate new APIs before adopting newer declarations.
- Hosted Windows/Linux/macOS results, interactive Mac checks and mandatory WSL evidence remain separate from local automated evidence.

After a failing platform check, create a focused fix branch from tested local `main`, add the regression, pass the full gate, merge locally with `--no-ff`, then rerun affected checks against the new candidate. Preserve failed-run evidence. Record the final commit, checksum, six job URLs/results and WSL sign-off in `PROGRESS.md` before any release decision. The user requested the four features below before completing the release gate. Definition-navigation work remains deferred; the new feature candidate still requires fresh CI, installed-extension and WSL evidence.
