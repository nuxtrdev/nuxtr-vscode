/** Resolve installed Nitro task APIs and generate safe nested task names and opt-in config edits. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { normalizedExtension } from './generated';
import { configModule } from './modules';

/** Inspect Nuxt's actual builder dependencies before project-level packages, without evaluating their code. */
export function installedNitroMajor (root: string): 2 | 3 {
    const project = createRequire(resolve(root, 'package.json'));
    const sources = [project];
    try {
        const nuxt = createRequire(project.resolve('nuxt/package.json'));
        sources.unshift(nuxt);
        try { sources.unshift(createRequire(nuxt.resolve('@nuxt/nitro-server/package.json'))); } catch { /* Nuxt 3 keeps Nitro directly. */ }
    } catch { /* A project-local Nitro install can still be inspected. */ }
    for (const source of sources) {
        for (const name of ['nitropack', 'nitro']) {
            try {
                const version = JSON.parse(readFileSync(source.resolve(name + '/package.json'), 'utf8')).version;
                const major = Number(version.split('.')[0]);
                if (major === 2 || major === 3) { return major; }
            } catch { /* Try another documented package location. */ }
        }
    }
    throw new Error('Cannot determine the installed Nitro generation. Install this Nuxt project’s dependencies before creating tasks.');
}

/** Convert db:migrate or db/migrate.ts to a nested file path and canonical runtime task name. */
export function taskIdentity (name: string) {
    const path = normalizedExtension(name.replaceAll(':', '/'), '.ts').replaceAll('\\', '/');
    if (!path.split('/').every(segment => /^[a-z\d_-]+$/i.test(segment))) { throw new Error('Use task name segments containing letters, numbers, underscores or hyphens.'); }
    return { path, name: path.replaceAll('/', ':') };
}

/** Generate the task helper/import matching the installed Nitro generation. */
export function nitroTaskTemplate (name: string, major: 2 | 3): string {
    const task = taskIdentity(name);
    return `/** Run the ${task.name} maintenance task on demand. */\n${major === 3 ? 'import { defineTask } from \'nitro/task\'\n\n' : ''}export default defineTask({\n  meta: { name: '${task.name}', description: 'Describe this task' },\n  /** Process the supplied task payload and return its result. */\n  run({ payload, context }) {\n    // Add task logic using payload and context as needed.\n    return { result: 'Success' }\n  }\n})\n`;
}

/** Enable tasks only through an explicit user action, preserving comments and unrelated Nitro settings. */
export function enableTasksSource (source: string): string {
    const { module, config } = configModule(source);
    config.nitro ||= {};
    config.nitro.experimental ||= {};
    if (config.nitro.experimental.tasks === true) { return source; }
    config.nitro.experimental.tasks = true;
    return module.generate().code.trimEnd() + '\n';
}
