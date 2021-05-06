import React, { FunctionComponent } from 'react';
import LeftMenuItem from './leftMenuItem';
import * as Styled from './styled';

interface LeftMenuProps {
  menu: App.UI.LeftMenu;
  currentPath: App.UI.IdPath;
}

const LeftMenu: FunctionComponent<LeftMenuProps> = (props) => {
  const { menu: { title, onSelect, options }, currentPath } = props;

  return (
    <Styled.LeftMenuContainer>
      {title &&
        <Styled.LeftMenuTitle>
          {title}
        </Styled.LeftMenuTitle>
      }
      <Styled.LeftMenuItems>
        {options.map((option) =>
          <LeftMenuItem
            key={option.value}
            option={option}
            onSelect={onSelect}
            currentPath={currentPath}
          />,
        )}
      </Styled.LeftMenuItems>
    </Styled.LeftMenuContainer>
  );
};

export default LeftMenu;
