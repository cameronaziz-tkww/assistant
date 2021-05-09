import React, { FunctionComponent, MouseEvent } from 'react';
import * as Styled from './styled';

interface SidebarProps {
  hide(): void;
  isHidden: boolean;
}

const Sidebar: FunctionComponent<SidebarProps> = (props) => {
  const { hide, isHidden } = props;

  const handleClick = (event: MouseEvent<SVGElement>) => {
    event.preventDefault();
    hide();
  };

  return (
    <Styled.SidebarContainer isHidden={isHidden}>
      <Styled.CloseButton
        onClick={handleClick}
      />
    </Styled.SidebarContainer>
  );
};

export default Sidebar;
