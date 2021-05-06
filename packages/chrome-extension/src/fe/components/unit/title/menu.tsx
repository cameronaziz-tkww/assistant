import React, { ReactElement } from 'react';
import MenuItem from './menuItem';
import * as Styled from './styled';

interface MenuProps<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>> {
  menuItems: App.Menu.ItemConfiguration<T, U>[];
  menuLocation: App.Menu.MenuLocation;
}

function Menu<T extends App.Menu.SelectOption<string>, U extends App.Menu.SelectOption<string>>(props: MenuProps<T, U>): ReactElement<MenuProps<T, U>> | null {
  const { menuItems, menuLocation } = props;

  const Container = menuLocation === 'left' ? Styled.MenuLeftContainer : Styled.MenuRightContainer;

  return (
    <Container>
      {menuItems.map((menuItem) =>
        <MenuItem key={menuItem.id} item={menuItem} />,
      )}
    </Container>
  );
}

export default Menu;
