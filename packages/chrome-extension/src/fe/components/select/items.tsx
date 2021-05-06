import React, { ReactElement } from 'react';
import Item from './item';
import * as Styled from './styled';

interface ItemsProps<T> {
  isActive?: boolean;
  options: T[];
  onItemSelect(option: T, nextValue: boolean): void;
  selectedItem: T | null;
  isAbsolute: boolean;
  hasTitle: boolean;
}

function Items<T extends App.Menu.SelectOption<string>>(props: ItemsProps<T>): ReactElement<ItemsProps<T>> {
  const { isActive, hasTitle, options, onItemSelect, isAbsolute, selectedItem } = props;

  return (
    <Styled.Items
      hasTitle={hasTitle}
      isAbsolute={isAbsolute}
      isActive={isActive}
    >
      {isActive && options.map((option) =>
        <Item
          key={option.value}
          isSelected={option.value === selectedItem?.value}
          onSelect={onItemSelect}
          option={option}
        />,
      )}
    </Styled.Items>
  );
}

export default Items;
