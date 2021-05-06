
export const getNextState = (hasIncludes: boolean, hasIgnore: boolean, currentState?: App.Filter.FilterState): App.Filter.FilterState => {
  if (hasIncludes) {
    if (currentState === 'omit') {
      return 'include';
    }

    if (currentState === 'include') {
      return 'omit';
    }

    if (currentState === 'exclude') {
      // this shouldn't happen
      return 'include';
    }
  }

  if (hasIgnore) {
    if (currentState === 'omit') {
      return 'exclude';
    }

    if (currentState === 'exclude') {
      return 'omit';
    }

    if (currentState === 'include') {
      // this shouldn't happen
      return 'exclude';
    }
  }

  if (currentState === 'include') {
    return 'exclude';
  }

  if (currentState === 'exclude') {
    return 'omit';
  }

  return 'include';
};

export const getReverse = (nextState: App.Filter.FilterState, currentState: App.Filter.FilterState): App.Filter.FilterState => {
  if (currentState === nextState) {
    return currentState;
  }

  if (currentState === 'omit') {
    if (nextState === 'include') {
      return 'exclude';
    }
    if (nextState === 'exclude') {
      return 'include';
    }
  }

  return currentState;
};
