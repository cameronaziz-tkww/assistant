export namespace Options {

  export interface GlobalSchema {
    projectRoots: string[];
  }

  type ESLintOptions = unknown | unknown[];

  /**
   * NOTE: Using this generic has some caveats for array option types
   *
   * Providing an array option, as so: AddGlobalSchema<string[]>
   * Will result in [string, GlobalSchema]
   *
   * Proper use would be AddGlobalSchema<[string[]]>
   * To result in [string[], GlobalSchema]
   * */
  export type AddGlobalSchema <T extends ESLintOptions = []> =
    T extends undefined ? [GlobalSchema] :
    T extends unknown[] ? [...T, GlobalSchema] : [T, GlobalSchema];

  export interface RunOn {
    include?: string | string[];
    ignore?: string | string[];
  }

  export interface RuleSchema {
    excludeDefault?: boolean;
    runOn?: RunOn;
  }

  export type BaseRule = AddGlobalSchema<RuleSchema>;
}
