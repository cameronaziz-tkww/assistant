import { OutputChannel } from 'vscode';
interface ShowErrorOptions {
    outputChannel?: OutputChannel;
    allowReportToSlack?: boolean;
}
declare const _default: {
    showError: (message: string, options?: ShowErrorOptions | undefined) => void;
    reportError: (message: string, outputChannel?: OutputChannel | undefined) => void;
};
export default _default;
