import { window, QuickPick, QuickPickItem, QuickInputButton, OpenDialogOptions, Uri } from 'vscode';
import { downloadTemplate } from 'giget';
import { ofetch } from 'ofetch';
import { NuxtOfficialTemplate } from '../types';
import { openExternalLink, openFolder, quickOpenButtons } from '../utils';


const fetchOfficialTemplates = async () => {
    try {
        const res = await ofetch('https://nuxt.new/data/starters.json');
        return res as NuxtOfficialTemplate[];
    } catch (error) {
        window.showErrorMessage(`Failed to fetch Nuxt templates`);
    }
};


const fetchTemplate = async (repo: NuxtOfficialTemplate, path: string, projectName: string) => {
    try {
        await downloadTemplate(`${repo.branch}`, {
            cwd: path,
            registry: "https://raw.githubusercontent.com/nuxt/starter/templates/templates",
            dir: projectName,
        });
    } catch (error) {
        console.log('error', error);
        window.showErrorMessage(`Failed to fetch Nuxt ${repo.name} template`);
    }
};

const createProjectPrompt = async (templates: NuxtOfficialTemplate[]) => {
    const picker: QuickPick<QuickPickItem> = window.createQuickPick();

    picker.canSelectMany = false;
    picker.ignoreFocusOut = true;
    picker.matchOnDescription = true;
    picker.placeholder = "Select a Nuxt template";

    const items: QuickPickItem[] = templates.map((item) => ({
        label: item.name,
        description: item.description,
        buttons: [quickOpenButtons.github, quickOpenButtons.docs],
        package: item,
    } as QuickPickItem));


    picker.items = items;

    picker.onDidChangeSelection((selection) => handleSelection(templates, selection.slice(), picker));
    picker.onDidTriggerItemButton((e) => handleItemButton(e as any));
    picker.onDidChangeSelection((item: any) => picker.dispose());
    picker.show();
};

const handleSelection = async (templates: NuxtOfficialTemplate[], selection: QuickPickItem[], picker: QuickPick<QuickPickItem>) => {
    if (selection[0]) {
        const repo = templates.find((item) => item.name === selection[0].label);
        if (repo) {
            try {
                const proName = await window.showInputBox({
                    placeHolder: 'Project Name',
                    prompt: 'Enter a project name',
                });

                if (proName) {
                    const options: OpenDialogOptions = {
                        canSelectMany: false,
                        openLabel: 'Select',
                        canSelectFiles: false,
                        canSelectFolders: true,
                    };

                    window.showOpenDialog(options).then(async (fileUri) => handleFileUri(fileUri, repo, proName));
                }
            } catch (error) {
                window.showErrorMessage(`Failed to fetch Nuxt ${repo.name} template`);
            }
        }
    }
};

const handleFileUri = async (fileUri: Uri[] | undefined, repo: NuxtOfficialTemplate, proName: string) => {
    if (fileUri && fileUri[0]) {
        try {
            await fetchTemplate(repo, fileUri[0].fsPath, proName);
            const result = await window.showInformationMessage(`Project created`, 'Open in current window', 'Open in new window');
            const projectPath = `${fileUri[0].fsPath}/${proName}`
            const projectURI = Uri.file(projectPath)


            if (result === 'Open in current window') {
                openFolder(projectURI, proName, false);
            }

            if (result === 'Open in new window') {
                openFolder(projectURI, proName, true);
            }
        } catch (error) {
            window.showInformationMessage(`Failed to create Nuxt ${proName} template`);
        }
    }
};

const handleItemButton = async (e: { item: QuickPickItem & { package: NuxtOfficialTemplate }; button: QuickInputButton }) => {
    const selectedItem = e.item;
    if (e.button === quickOpenButtons.github) {
        openExternalLink(`https://github.com/${selectedItem.package.repo}/tree/${selectedItem.package.branch}`);
    }

    if (e.button === quickOpenButtons.docs) {
        openExternalLink(selectedItem.package.docs);
    }
};


export async function createProject() {
    try {
        const templates = await fetchOfficialTemplates() as NuxtOfficialTemplate[];

        if (!templates) {
            return;
        } else {
            await createProjectPrompt(templates);
        }
    } catch (error) {
        window.showErrorMessage(`Failed to fetch Nuxt templates`);
    }
}
