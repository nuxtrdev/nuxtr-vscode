/** Install the selected project's dependencies using its detected or explicitly selected workspace manager. */
import { managerCommand, terminalCommand } from '../core/managers';
import { choosePackageManager } from '../utils/dependency';
import { currentProject } from '../services/project';
import { newTerminal } from '../utils/global';

/** Launch dependency installation from the package-manager workspace root, honoring fallback settings. */
export async function installDependencies () {
    const manager = await choosePackageManager();
    if (!manager) { return; }
    const command = managerCommand(manager, 'install', currentProject().packageManagerRoot);
    newTerminal('Install Dependencies', terminalCommand(command), command.cwd);
}
