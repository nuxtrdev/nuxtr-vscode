/** Own the Nuxtr output channel used for diagnostics and process results. */
import { OutputChannel, window } from 'vscode'
class Logger {
    private static _instance: Logger
    private _outputChannel: OutputChannel

    /** Create the shared log channel on first use. */
    private constructor () {
        this._outputChannel = window.createOutputChannel('Nuxtr', { log: true })
    }

    /** Return the one channel shared by extension services. */
    public static getInstance (): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger()
        }
        return Logger._instance
    }

    /** Append a diagnostic line without opening the panel. */
    public log (message: string): void {
        this._outputChannel.appendLine(message)
    }

    /** Bring the log panel into view. */
    public show (): void {
        this._outputChannel.show()
    }
    /** Release the channel with the extension lifetime. */
    public dispose () { this._outputChannel.dispose(); }
}

export const logger = Logger.getInstance()