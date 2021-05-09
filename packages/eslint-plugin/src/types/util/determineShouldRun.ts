import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { Options, SearchMatch } from '../index';

export namespace ShouldRun {

	export interface GetModuleNameConfig {
		matchResult: string[];
		filenamePathPieces: string[];
		moduleIsFile?: boolean;
		patterns: string[];
		isMatchedFile: boolean;
		rawFilename: string;
	}

	export interface GetModuleNameResult {
		moduleNameRaw: string;
		moduleName: string;
		fileExtension: string;
	}

	export interface GetGlobsConfig {
		globPatterns: SearchMatch;
		consumerOptions?: Options.RuleSchema;
	}

	export interface Config <T extends Context>{
		context: T;
		globPatterns: SearchMatch;
		moduleIsFile?: true;
		consumerOptions?: Options.RuleSchema,
	}

	export interface BreakFilenameConfig {
		replacer: string;
		rawFilename: string;
	}

	type Options<T extends readonly unknown[] = readonly unknown[]> =
		readonly [...T, Options.GlobalSchema];
	export type Context = Readonly<TSESLint.RuleContext<string, Options>>;
}
