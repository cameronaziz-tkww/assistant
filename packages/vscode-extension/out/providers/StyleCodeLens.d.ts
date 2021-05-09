import { CodeLens, CodeLensProvider, Event, TextDocument } from 'vscode';
import Initializer from '../commands/Initializer';
declare type LensType = 'convert' | 'unused' | 'invalid';
export interface StyleCodeLenses {
    codeLens: CodeLens;
    startLine: number;
    type: LensType;
}
declare class StyleCodeLens implements CodeLensProvider {
    private codeLensSettings;
    private codeLenses;
    private _onDidChangeCodeLenses;
    private initializer;
    private gutterIcons;
    readonly onDidChangeCodeLenses: Event<void>;
    constructor(initializer: Initializer);
    provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]>;
    private changeType;
    private findInvalidImports;
    private findUnused;
    private addGutterIcon;
}
export default StyleCodeLens;
