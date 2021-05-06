import React, { ReactElement } from 'react';
import ClickOutside from '../../clickOutside';
import Items from '../items';
import * as Styled from '../styled';
import Option from './option';

interface FloatingProps<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>> {
  isActive: boolean;
  title?: string;
  options: T[];
  onCancel(): void;
  onItemSelect(option: T | U, nextValue: boolean): void;
  selectedItem: T | null;
  footerOptions?: U[];
  hideCaret?: boolean;
}

function Floating<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>>(props: FloatingProps<T, U>): ReactElement<FloatingProps<T, U>> | null {
  const { onCancel, isActive, selectedItem, onItemSelect, title, footerOptions, hideCaret, options } = props;

  const onClickOutside = () => {
    onCancel();
  };

  const FloatingItems = hideCaret ? Styled.FloatingItems : Styled.FloatingItemsWithCaret;

  if (!isActive) {
    return null;
  }

  return (
    <Styled.FloatingContainer>
      <ClickOutside
        live={isActive}
        onClickOutside={onClickOutside}
      />
      <FloatingItems>
        {title &&
          <Styled.FloatingTitle isActive>
            {title}
          </Styled.FloatingTitle>
        }
        <Items<T>
          isActive={isActive}
          isAbsolute={false}
          hasTitle={!!title}
          selectedItem={selectedItem}
          options={options}
          onItemSelect={onItemSelect}
        />
        {footerOptions &&
          <Styled.FloatingFooter isActive>
            {footerOptions.map((option) =>
              <Option<U>
                key={option.value}
                option={option}
                onItemSelect={onItemSelect}
              />,
            )}
          </Styled.FloatingFooter>
        }
      </FloatingItems>
    </Styled.FloatingContainer>
  );
}

export default Floating;
