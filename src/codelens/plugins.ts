import { CodeLens, workspace, EventEmitter, Event, TextDocument, Position, CodeLensProvider, } from 'vscode';

export class PluginsCodelensProvider implements CodeLensProvider {

    private codeLenses: CodeLens[] = []
    private regex: RegExp
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>()
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event

    constructor() {
        this.regex = /plugins:/g

        workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire()
        })
    }

    public provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]> {

        if (workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
            this.codeLenses = []
            const regex = new RegExp(this.regex)
            const text = document.getText()
            let matches
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line)
                const indexOf = line.text.indexOf(matches[0])
                const position = new Position(line.lineNumber, indexOf)
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex))
                if (range) {
                    this.codeLenses.push(new CodeLens(range))
                }
            }
            return this.codeLenses
        }
        return []
    }

    public resolveCodeLens(codeLens: CodeLens) {
        if (workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
            codeLens.command = {
                title: 'Add new plugin',
                command: 'nuxtr.createPlugin',
                tooltip: "Tooltip provided by sample extension",
                arguments: ["Argument 1", false]
            }
            return codeLens
        }
    }
}
