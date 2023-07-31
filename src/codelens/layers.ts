import { CodeLens, workspace, EventEmitter, Event, TextDocument, CancellationToken, Position, CodeLensProvider } from 'vscode'

export class LayersCodeLensProvider implements CodeLensProvider {

    private codeLenses: CodeLens[] = []
    private regex: RegExp
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>()
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event

    constructor() {
        this.regex = /extends:/g,

        workspace.onDidChangeConfiguration((_) => { this._onDidChangeCodeLenses.fire() })
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {

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

    public resolveCodeLens(codeLens: CodeLens, token: CancellationToken) {
        if (workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
            codeLens.command = {
                title: 'Add new layer',
                tooltip: "Nuxtr: Add new layer",
                command: 'nuxtr.createLayer',
                arguments: ["Argument 1", false]
            }
            return codeLens
        }
        return null
    }
}
