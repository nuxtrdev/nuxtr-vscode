/** Register project-scoped config actions and own their lifetime with the extension. */
import { CodeLens, CodeLensProvider, ExtensionContext, Range, TextDocument, languages } from 'vscode';
import { configModule } from '../core/modules';
import { currentProject } from '../services/project';

class ConfigCodeLensProvider implements CodeLensProvider {
    /** Attach actions only to literal properties in a discovered Nuxt configuration. */
    provideCodeLenses (document: TextDocument): CodeLens[] {
        try {
            if (currentProject(document.uri).configPath !== document.uri.fsPath) { return []; }
            const { config } = configModule(document.getText());
            const actions = [['modules', 'Add new module', 'nuxtr.createModuleAction'], ['plugins', 'Add new plugin', 'nuxtr.createPlugin'], ['extends', 'Add new layer', 'nuxtr.createLayer']];
            const lenses: CodeLens[] = [];
            for (const [key, title, command] of actions) {
                const offset = config[key]?.$ast?.start;
                if (typeof offset !== 'number') { continue; }
                const position = document.positionAt(offset);
                lenses.push(new CodeLens(new Range(position, position), { title, command, arguments: [document.uri] }));
            }
            return lenses;
        } catch { return []; }
    }
}

/** Register one provider for supported configs, including remote extension hosts and JavaScript configs. */
function activateCodelenses (context: ExtensionContext) {
    context.subscriptions.push(languages.registerCodeLensProvider([
        { pattern: '**/nuxt.config.{ts,js,mjs,cjs}' }, { pattern: '**/.config/nuxt.ts' }
    ], new ConfigCodeLensProvider()));
}
export default { activateCodelenses };
