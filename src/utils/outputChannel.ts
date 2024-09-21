import { OutputChannel, window } from 'vscode'
class Logger {
    private static _instance: Logger
    private _outputChannel: OutputChannel

    private constructor () {
        this._outputChannel = window.createOutputChannel('Nuxtr', { log: true })
    }

    public static getInstance (): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger()
        }
        return Logger._instance
    }

    public log (message: string): void {
        this._outputChannel.appendLine(message)
    }

    public show (): void {
        this._outputChannel.show()
    }
}

export const logger = Logger.getInstance()