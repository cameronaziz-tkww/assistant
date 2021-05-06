import React, { ReactElement } from 'react';
import * as Styled from './styled';

interface ItemProps<T extends App.Menu.SelectOption<string>> {
  option: T;
  onSelect(option: T, nextValue: boolean): void;
  isSelected: boolean;
}

function Item<T extends App.Menu.SelectOption<string>>(props: ItemProps<T>): ReactElement<ItemProps<T>> {
  const { option, onSelect, isSelected } = props;

  const onClick = () => {
    onSelect(option, !isSelected);
  };

  return (
    <Styled.Item
      onClick={onClick}
      isSelected={isSelected}
    >
      {option.label}
    </Styled.Item>
  );
}

export default Item;
