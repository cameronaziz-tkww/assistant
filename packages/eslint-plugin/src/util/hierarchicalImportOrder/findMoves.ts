import type { Specifier, Move } from './types';

const bubbleSort = (specifiers: Specifier[]) => {
  const specifiersCopy = specifiers.slice();
  const moves: Move[] = [];

  specifiersCopy.forEach((specifier, newPosition) => {
    const isCorrect = specifier.expectedPlace === newPosition;

    if (isCorrect) {
      return;
    }

    const positionBeforeMove = specifiersCopy
      .findIndex((item) => item.expectedPlace === newPosition);

    const source = specifiersCopy[positionBeforeMove];
    const beforeAtDestination = specifiersCopy[source.expectedPlace - 1];
    const nextAtDestination = specifiersCopy[source.expectedPlace];
    const nextBeforeFix = specifiersCopy[positionBeforeMove + 1];

    moves.push({
      beforeAtDestination,
      nextAtDestination,
      nextBeforeFix,
      positionBeforeMove,
      specifier: source,
    });

    specifiersCopy.splice(positionBeforeMove, 1);
    specifiersCopy.splice(newPosition, 0, source);

  });

  return moves;
};

const insertSort = (specifiers: Specifier[]) => {
  const specifiersCopy = specifiers.slice();
  const moves: Move[] = [];
  const map = new WeakMap<Specifier, Move>();
  for (let i = 1; i < specifiersCopy.length; i += 1) {
    let j = i - 1;
    const current = specifiersCopy[i];
    const nextBeforeFix = specifiersCopy[i + 1];
    const nextAtDestination = specifiersCopy
      .find((item) => item.expectedPlace === i + 1) || null;
    const beforeAtDestination = specifiersCopy
      .find((item) => item.expectedPlace === i) || null;
    while (j >= 0 && specifiersCopy[j].expectedPlace > current.expectedPlace) {
      const source = specifiersCopy[j];
      specifiersCopy[j + 1] = specifiersCopy[j];
      j = j - 1;
      map.set(
        source,
        {
          beforeAtDestination,
          nextAtDestination,
          nextBeforeFix,
          positionBeforeMove: i,
          specifier: source,
        },
      );
    }
    specifiersCopy[j + 1] = current;
  }

  specifiersCopy.map((specifier) => {
    const value = map.get(specifier);
    if (value) {
      moves.push(value);
    }
  });

  return moves;
};

const findMoves = (specifiers: Specifier[]) => {
  const bubble = bubbleSort(specifiers);
  const insert = insertSort(specifiers);
  return bubble.length < insert.length ? bubble : insert;
};

export default findMoves;
