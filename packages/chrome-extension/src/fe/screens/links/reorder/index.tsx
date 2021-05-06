import Button from '@components/button';
import { modal } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';

const Reorder: FunctionComponent = () => {
  const update = modal.useUpdate();
  const hide = modal.useHide();

  const handleClick = () => {
    update.selection('save');
    hide.units(['github', 'jira', 'settings-icon']);
  };

  return (
    <Styled.RightContainer>
      <Button onClick={handleClick}>
        Adjust link order
      </Button>
    </Styled.RightContainer>
  );
};

export default Reorder;