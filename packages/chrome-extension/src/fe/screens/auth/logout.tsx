import Button from '@components/button';
import React, { FunctionComponent } from 'react';
import * as Styled from '../styled';

interface LogoutProps {
  handleClickLogout(): void
}

const Logout: FunctionComponent<LogoutProps> = (props) => {
  const { handleClickLogout } = props;

  return (
    <Styled.RightContainer>
      <Button
        onClick={handleClickLogout}
        label="Logout"
      />
    </Styled.RightContainer>
  );
};

export default Logout;
