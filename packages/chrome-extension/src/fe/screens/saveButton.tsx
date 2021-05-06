import Button from '@components/button';
import { links, modal } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

const SaveButton: FunctionComponent = () => {
  const { save } = links.useReorderLinks();
  const update = modal.useUpdate();
  const hide = modal.useHide();

  const handleClick = () => {
    save();
    update.selection('links');
    hide.units([]);
  };

  return (
    <Styled.SaveButtonContainer>
      <Button onClick={handleClick} size="xl">
        Save
      </Button>
    </Styled.SaveButtonContainer>
  );
};

export default SaveButton;
