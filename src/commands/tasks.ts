/** Create Nitro tasks under the configured server directory and offer an explicit experimental-feature opt-in. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { window } from 'vscode';
import { containsPath } from '../core/project';
import { enableTasksSource, installedNitroMajor, nitroTaskTemplate, taskIdentity } from '../core/tasks';
import { currentProject } from '../services/project';
import { createFile, scaffoldExtension } from '../utils';
import { readStaticConfig } from '../core/directories';
import { projectDirectory } from '../utils/nuxt';

/** Enable Nitro's experimental tasks while retaining the rest of the project configuration. */
export function enableNitroTasks () {
    const { configPath } = currentProject();
    const source = readFileSync(configPath, 'utf8');
    writeFileSync(configPath, enableTasksSource(source), 'utf8');
    return window.showInformationMessage('Nitro tasks enabled. Restart the Nuxt development server to load them.');
}

/** Prompt for a nested task name and create it without changing experimental settings silently. */
export async function createNitroTask (folder?: string) {
    const major = installedNitroMajor(currentProject().root);
    const tasks = join(projectDirectory('server'), 'tasks');
    const directory = folder && containsPath(tasks, folder) ? folder : tasks;
    const name = await window.showInputBox({ prompt: 'Task name (for example db:migrate)', placeHolder: 'db:migrate' });
    if (!name) { return; }
    const task = taskIdentity(name);
    const fullName = relative(tasks, join(directory, task.path)).replaceAll('\\', '/');
    const created = await createFile({ fileName: task.path, fullPath: join(directory, task.path + scaffoldExtension()), content: nitroTaskTemplate(fullName, major) });
    if (!created) { return; }
    const config = readStaticConfig(currentProject().configPath);
    if (config.nitro?.experimental?.tasks !== true) {
        const choice = await window.showInformationMessage('This task needs nitro.experimental.tasks to run.', 'Enable Tasks', 'Keep Disabled');
        if (choice === 'Enable Tasks') { await enableNitroTasks(); }
    }
}

/** Use an Explorer task subfolder when it belongs to the resolved server/tasks tree. */
export function directCreateNitroTask (folder: string) { return createNitroTask(folder); }
