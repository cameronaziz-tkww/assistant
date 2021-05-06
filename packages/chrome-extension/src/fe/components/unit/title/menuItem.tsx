import React, { MouseEvent, ReactElement, useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { FiCheck } from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';
import { Button } from '../../button';
import { FloatingSelect } from '../../select';
import * as Styled from './styled';

interface MenuItemProps<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>> {
  item: App.Menu.ItemConfiguration<T, U>
}

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

type IconState = 'default' | 'rotating' | 'check';

const getIcon = (iconState: IconState, Icon: IconType): IconType => {
  switch (iconState) {
    case 'check': return FiCheck;
    case 'rotating': return (
      styled(Icon)`
        animation: ${Styled.rotate} 2s infinite linear;
      `);
    default: return Icon;
  }
};

function MenuItem<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>>(props: MenuItemProps<T, U>): ReactElement<MenuItemProps<T, U>> | null {
  const { item: { isRotating, dropdown, handleClick, icon } } = props;
  const isDropdown = !!dropdown;
  const [isActive, setIsActive] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [iconIsRotating, setIconIsRotating] = useState(isRotating);
  const [iconState, setIconState] = useState<IconState>('default');

  useEffect(
    () => {

      if (iconIsRotating) {
        setIconState('rotating');
        return;
      }

      if (!hasMounted) {
        setHasMounted(true);
        return;
      }

      setIconState('check');

      setTimeout(
        () => {
          setIconState('default');
        },
        3000,
      );

    },
    [iconIsRotating],
  );

  useEffect(
    () => {
      if (isRotating !== iconIsRotating) {
        setIconIsRotating(isRotating);
      }
    },
    [isRotating],
  );

  const onButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (handleClick) {
      handleClick(event);
    }

    if (isDropdown) {
      setIsActive(true);
    }
  };

  const onItemSelect = (item: T) => {
    dropdown?.handleClick(item);
    onCancel();
  };

  const onCancel = () => {
    setIsActive(false);
  };

  const Icon = getIcon(iconState, icon);

  return (
    <div>
      <Button
        round
        clearBackground
        block
        noMargin
        isActive={isActive}
        Icon={Icon}
        onClick={onButtonClick}
      />
      {dropdown &&
        <FloatingSelect
          onCancel={onCancel}
          isActive={isActive}
          onItemSelect={onItemSelect}
          selectedItem={null}
          {...dropdown}
        />
      }
    </div>
  );
}

export default MenuItem;
