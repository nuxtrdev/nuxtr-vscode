/** Activate public commands before project discovery so empty and non-Nuxt windows remain usable. */
import { ExtensionContext, commands } from 'vscode';
import { initializeProjects } from './services/project';

/** Register owned commands first, then load project services only when a Nuxt workspace is available. */
export async function activate (context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('nuxtr.createProject', async () => {
        const { createProject } = await import('./commands/project');
        await createProject();
    }));
    let servicesActive = false;
    await initializeProjects(context, async (available) => {
        await commands.executeCommand('setContext', 'nuxtr.isNuxtProject', available);
        if (available && !servicesActive) {
            const { isNuxtTwo } = await import('./utils/nuxt');
            await commands.executeCommand('setContext', 'nuxtr.isNuxtTwo', isNuxtTwo());
            const { activateExtension } = await import('./extension');
            await activateExtension(context);
            servicesActive = true;
        }
    });
}
