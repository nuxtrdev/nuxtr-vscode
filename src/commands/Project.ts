import { downloadTemplate } from 'giget';
import { ofetch } from 'ofetch';
import { OpenDialogOptions, QuickInputButton, QuickPick, QuickPickItem, ThemeIcon, Uri, window } from 'vscode';
import { NuxtOfficialTemplate, UserProjectTemplate } from '../types';
import { nuxtrConfiguration, openExternalLink, openFolder, quickOpenButtons } from '../utils';

const parseRepoURL = (repoURL: string) => {
    const matchResult = repoURL.match(/\/\/([^/]+)\/([^/]+)\/(.+)$/);

    if (matchResult) {
        const [, fullProvider, owner, fullRepo] = matchResult;
        const provider = fullProvider.split('.')[0];
        const repo = fullRepo.replace('.git', '').split('/')[0].split('#')[0];
        return { provider, owner, repo };
    }

    return null;
};


const fetchOfficialTemplates = async (): Promise<NuxtOfficialTemplate[]> => {
    try {
        const res = await ofetch('https://nuxt.new/data/starters.json');
        return res as NuxtOfficialTemplate[];
    } catch {
        window.showErrorMessage(`Failed to fetch Nuxt templates`);
        return [];
    }
};

const fetchUserTemplates = (): UserProjectTemplate[] => {
    try {
        return nuxtrConfiguration().projectTemplates.map((item) => ({
            name: item.name,
            repoURL: item.repoURL,
            description: item.description,
            branch: item.branch,
        } as UserProjectTemplate));
    } catch {
        window.showErrorMessage(`Failed to fetch user templates`);
        return [];
    }
};
const fetchTemplate = async (repo: NuxtOfficialTemplate, path: string, projectName: string) => {
    try {
        await downloadTemplate(`${repo.branch}`, {
            cwd: path,
            registry: "https://raw.githubusercontent.com/nuxt/starter/templates/templates",
            dir: projectName,
        });
    } catch {
        window.showErrorMessage(`Failed to fetch ${repo.name} template`);
    }
};

const fetchUserTemplate = async (template: UserProjectTemplate, path: string, projectName: string) => {
    const url = template.repoURL;
    const parsedURL = parseRepoURL(url);
    if (parsedURL) {

        const { provider, owner, repo } = parsedURL;
        const normalizedURL = `${owner}/${repo}${template.branch === undefined ? '' : `#${template.branch}`}`;

        try {
            await downloadTemplate(normalizedURL, {
                cwd: path,
                force: true,
                dir: projectName,
                provider,
            })
        } catch {
            window.showErrorMessage(`Failed to fetch ${template.name} template`);
        }
    } else {
        window.showErrorMessage(`Failed to parse ${template.name} repo URL`);
        return;
    }
};


const createProjectPrompt = (officialTemplates: NuxtOfficialTemplate[], userTemplates: UserProjectTemplate[]) => {
    const picker: QuickPick<QuickPickItem> = window.createQuickPick();

    picker.canSelectMany = false;
    picker.ignoreFocusOut = true;
    picker.matchOnDescription = true;
    picker.placeholder = "Select a Nuxt starter";

    const officialItems: QuickPickItem[] = officialTemplates.map((item) => ({
        label: item.name,
        description: item.description,
        buttons: [quickOpenButtons.github, quickOpenButtons.docs],
        package: item,
        iconPath: new ThemeIcon("nuxt-logo"),
    } as QuickPickItem));

    const userItems: QuickPickItem[] = userTemplates.map((item) => ({
        label: item.name,
        description: item.description,
        // Hide buttons for user templates
        buttons: [],
        package: item,
        iconPath: new ThemeIcon("account"),
    } as QuickPickItem));

    picker.items = [...officialItems, ...userItems];

    picker.onDidChangeSelection((selection) => handleSelection([...officialTemplates, ...userTemplates], [...selection]));
    picker.onDidTriggerItemButton((e) => handleItemButton(e as any));
    picker.onDidChangeSelection(() => picker.dispose());
    picker.show();
};


const handleSelection = async (templates: (NuxtOfficialTemplate | UserProjectTemplate)[], selection: QuickPickItem[]) => {
    if (selection[0]) {
        const selectedTemplate = templates.find((item) => item.name === selection[0].label);

        if (selectedTemplate) {
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

                window.showOpenDialog(options).then((fileUri) => handleFileUri(fileUri, selectedTemplate, proName));
            }
        }
    }
};

const handleFileUri = async (fileUri: Uri[] | undefined, template: (NuxtOfficialTemplate | UserProjectTemplate), proName: string) => {
    if (fileUri && fileUri[0]) {
        try {
            if ('repo' in template) {
                // It's a NuxtOfficialTemplate
                const repo = template as NuxtOfficialTemplate;
                await fetchTemplate(repo, fileUri[0].fsPath, proName);
            } else {
                // It's a UserProjectTemplate
                const userTemplate = template as UserProjectTemplate;
                await fetchUserTemplate(userTemplate, fileUri[0].fsPath, proName);
            }

            const result = await window.showInformationMessage(`Project created`, 'Open in current window', 'Open in new window');
            const projectPath = `${fileUri[0].fsPath}/${proName}`;
            const projectURI = Uri.file(projectPath);

            if (result === 'Open in current window') {
                openFolder(projectURI, proName, false);
            }

            if (result === 'Open in new window') {
                openFolder(projectURI, proName, true);
            }
        } catch {
            window.showInformationMessage(`Failed to create ${proName} project.`);
        }
    }
};

const handleItemButton = (e: { item: QuickPickItem & { package: NuxtOfficialTemplate | UserProjectTemplate }; button: QuickInputButton }) => {
    const selectedItem = e.item;

    if ('repo' in selectedItem.package) {
        const repo = selectedItem.package as NuxtOfficialTemplate;

        if (e.button === quickOpenButtons.github) {
            openExternalLink(`https://github.com/${repo.repo}/tree/${repo.branch}`);
        }

        if (e.button === quickOpenButtons.docs) {
            openExternalLink(repo.docs);
        }
    } else if (e.button === quickOpenButtons.github || e.button === quickOpenButtons.docs) {
        // For now, you can leave this block empty or add custom behavior
    }
};

export async function createProject() {
    try {
        const nuxtTemplates = await fetchOfficialTemplates() as NuxtOfficialTemplate[];
        const userTemplates = await fetchUserTemplates() as UserProjectTemplate[];

        if (nuxtTemplates) {
            await createProjectPrompt(nuxtTemplates, userTemplates);
        } else {
            return;
        }
    } catch {
        window.showErrorMessage(`Failed to fetch Nuxt starters`);
    }
}
