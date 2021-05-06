declare namespace Notes {
  type SelectedPosition = {
    startCharacter: number;
    endCharacter: number;
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
  }

  type CharacterPosition = {
    row: number;
    column: number;
  }

  type Position = [lineIndex: number, characterIndex: number];
  type MouseEventType = 'up' | 'down';

}