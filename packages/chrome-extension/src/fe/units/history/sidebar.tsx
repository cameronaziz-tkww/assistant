import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface SidebarProps {
  hide(): void;
}

const Sidebar: FunctionComponent<SidebarProps> = (props) => {
  const { hide } = props;

  return (
    <Styled.SidebarContainer>
      <Styled.CloseButton onClick={hide} />
    </Styled.SidebarContainer>
  );
};

export default Sidebar;
