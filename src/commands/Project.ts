import { window, QuickPick, QuickPickItem, QuickInputButton, ThemeIcon, OpenDialogOptions, Uri, commands } from 'vscode';
import { downloadTemplate } from 'giget';
import { ofetch } from 'ofetch'
import { ProjectTemplate } from '../types'
import { projectRootDirectory, openExternalLink, openFolder } from '../utils';

const github: QuickInputButton = {
    iconPath: new ThemeIcon("github"),
    tooltip: "Template Github Repo",
}

const docs: QuickInputButton = {
    iconPath: new ThemeIcon("book"),
    tooltip: "Template Docs/Refrence",
}


const fetchTemplates = async () => {
    try {
        let res = await ofetch('https://nuxt.new/data/starters.json');
        return res as ProjectTemplate[]

    } catch (error) {
        window.showErrorMessage(`Failed to fetch Nuxt templates`)
    }
}

const fetchTemplate = async (repo: ProjectTemplate, path: string, projectName: string) => {
    try {
        await downloadTemplate(`${repo.branch}`, {
            cwd: path,
            registry: "https://raw.githubusercontent.com/nuxt/starter/templates/templates",
            dir: projectName,
        })
    } catch (error) {
        console.log('error', error);
        window.showErrorMessage(`Failed to fetch Nuxt ${repo.name} template`)
    }
}

export async function createProject() {
    try {
        const templates = await fetchTemplates() as ProjectTemplate[];

        if (!templates) {
            return;
        } else {


            const picker: QuickPick<QuickPickItem> = window.createQuickPick()

            picker.canSelectMany = false
            picker.ignoreFocusOut = true
            picker.matchOnDescription = true
            picker.placeholder = "Select a Nuxt template"

            const items: QuickPickItem[] = templates.map((item) => {
                return {
                    label: item.name,
                    description: item.description,
                    buttons: [github, docs],
                    package: item,
                }
            })

            picker.items = items


            picker.onDidChangeSelection(async (selection) => {
                if (selection[0]) {
                    const repo = templates.find((item) => item.name === selection[0].label)
                    if (repo) {
                        try {

                            const proName = await window.showInputBox({
                                placeHolder: 'Project Name',
                                prompt: 'Enter a project name',
                            })

                            if (proName) {

                                const options: OpenDialogOptions = {
                                    canSelectMany: false,
                                    openLabel: 'Select',
                                    canSelectFiles: false,
                                    canSelectFolders: true
                                };

                                window.showOpenDialog(options).then(async fileUri => {
                                    if (fileUri && fileUri[0]) {
                                        try {
                                            await fetchTemplate(repo, fileUri[0].fsPath, proName)
                                            const result = await window.showInformationMessage(`Projec created`, 'Open in current window', 'Open in new window')
                                            if (result === 'Open in current window') {
                                                let uri = Uri.file(`${fileUri[0].fsPath}/${proName}`);
                                                await openFolder(uri, proName, false)
                                            }

                                            if (result === 'Open in new window') {
                                                let uri = Uri.file(`${fileUri[0].fsPath}/${proName}`);
                                                await openFolder(uri, proName, true)
                                            }
                                        } catch (error) {
                                            window.showInformationMessage(`Failed to create Nuxt ${proName} template`)
                                        }
                                    }
                                });

                            }


                        } catch (error) {
                            window.showErrorMessage(`Failed to fetch Nuxt ${repo.name} template`)
                        }
                    }
                }
            })

            picker.onDidTriggerItemButton(async (e) => {
                const selectedItem = e.item as QuickPickItem & { package: ProjectTemplate }
                if (e.button === github) { openExternalLink(`https://github.com/${selectedItem.package.repo}`) }

                if (e.button === docs) { openExternalLink(selectedItem.package.docs) }
            })

            picker.onDidChangeSelection(async (item: any) => { picker.dispose() })

            picker.show()
        }

    } catch (error) {
        window.showErrorMessage(`Failed to fetch Nuxt templates`)
    }
}