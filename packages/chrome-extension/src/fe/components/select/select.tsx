import React, { ReactElement, useState } from 'react';
import ClickOutside from '../clickOutside';
import Items from './items';
import * as Styled from './styled';

interface SelectProps<T extends App.Menu.SelectOption<string>> {
  placeholder?: string;
  options: T[]
  onSelect?(option: T): void;
  deFaultSelection?: T;
  label?: string;
  inlineLabel?: boolean;
}

function Select<T extends App.Menu.SelectOption<string>>(props: SelectProps<T>): ReactElement<SelectProps<T>> {
  const { label, placeholder, options, onSelect, deFaultSelection } = props;
  const [isActive, setIsActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(deFaultSelection || null);

  const onOpen = () => {
    setIsActive(!isActive);
  };

  const onItemSelect = (option: T) => {
    setIsActive(false);
    setSelectedItem(option);

    if (onSelect) {
      onSelect(option);
    }
  };

  const onClickOutside = () => {
    setIsActive(false);
  };

  const selectText = selectedItem?.label || placeholder || 'Select';

  return (
    <Styled.SelectWrapper>
      <ClickOutside
        live={isActive}
        onClickOutside={onClickOutside}
      />
      {label &&
        <Styled.Label>
          {label}
        </Styled.Label>
      }
      <Styled.SelectComponent
        isActive={isActive}
        onClick={onOpen}
      >
        {selectText}
      </Styled.SelectComponent>
      <Items
        hasTitle={false}
        isAbsolute
        isActive={isActive}
        options={options}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </Styled.SelectWrapper >
  );
}

export default Select;
