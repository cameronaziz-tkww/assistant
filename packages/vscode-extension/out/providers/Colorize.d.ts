import { TextEditorDecorationType } from 'vscode';
import Initializer from '../commands/Initializer';
declare class Colorizer {
    decorationTypes: TextEditorDecorationType[];
    initializer: Initializer;
    constructor(initializer: Initializer);
    onChange: () => void;
    onLoad: () => void;
    private buildHexVariables;
    private analyzeFile;
}
export default Colorizer;
