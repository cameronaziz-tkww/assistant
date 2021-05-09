declare namespace Settings {
  interface CodeLens {
    findConverts: boolean;
    findInvalidImports: boolean;
    findNotImported: boolean;
    findUnusedImports: boolean;
    gutterIcon: boolean;
  }

  interface Colorize {
    enable: boolean;
    invertBackgroundColor: boolean;
  }

  interface Public {
    start: 'Always' | 'On Command';
    convertFileOnSave: boolean;
    colorize: Colorize;
    codeLens: CodeLens;
    hover: boolean;
    useTildes: true;
    localStorage: boolean;
  }
}
