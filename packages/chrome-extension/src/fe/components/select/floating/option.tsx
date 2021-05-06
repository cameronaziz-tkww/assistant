import React, { ReactElement } from 'react';
import Checkbox from '../../checkbox';

interface OptionProps<T extends App.Menu.SelectOption<string>> {
  option: T;
  onItemSelect(option: T, nextValue: boolean): void;
}

function Option<T extends App.Menu.SelectOption<string>>(props: OptionProps<T>): ReactElement<OptionProps<T>> | null {
  const { option, onItemSelect } = props;

  const selectItem = (nextValue: boolean) => {
    onItemSelect(option, nextValue);
  };
  return (
    <Checkbox
      handleClick={selectItem}
      key={option.value}
      label={option.label}
    />
  );
}

export default Option;
