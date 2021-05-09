import { Disposable } from 'vscode';
import Initializer from '../commands/Initializer';
declare const intellisense: (initializer: Initializer) => Disposable;
export default intellisense;
