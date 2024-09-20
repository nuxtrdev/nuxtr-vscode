import { env, extensions, version, window } from 'vscode';
import { detectPackageManagerByName, getNuxtVersion, getPackageManagerVersion } from '../utils';

export async function generateBugInfoReport() {
    const nuxtr = extensions.getExtension('nuxtr.nuxtr-vscode');

    const operatingSystem = process.platform;
    const vscodeVersion = version;
    const nuxtrVersion = nuxtr?.packageJSON.version;
    const nuxtVersion = await getNuxtVersion();
    const pm = detectPackageManagerByName();
    const packageManager = pm?.name || 'Unknown';

    if (!pm) {
        window.showErrorMessage('No package manager found');
        return;
    }

    const pmVersion = await getPackageManagerVersion(pm?.name);

    const reportLines = [
        `- Operating System: \`${operatingSystem}\``,
        `- VSCode Version: \`${vscodeVersion}\``,
        `- Nuxtr Version: \`${nuxtrVersion}\``,
        `- Nuxt Version: \`${nuxtVersion}\``,
        `- Package Manager: \`${packageManager}@${pmVersion}\``
    ];

    const bugReportInfo = reportLines.join('\n');

    env.clipboard.writeText(bugReportInfo);

    const prompt = window.showInformationMessage('Bug report info copied to clipboard', 'Copy again');

    prompt.then((answer) => {
        if (answer === 'Copy again') {
            env.clipboard.writeText(bugReportInfo);
        }
    });
}
