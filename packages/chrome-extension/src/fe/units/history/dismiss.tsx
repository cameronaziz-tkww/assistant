import Tooltip from '@components/tooltip';
import { history } from '@hooks';
import React, { FunctionComponent } from 'react';
import { FaTrash } from 'react-icons/fa';
import * as Styled from './styled';

interface DismissProps {
  itemId: string;
}

const Dismiss: FunctionComponent<DismissProps> = (props) => {
  const { itemId } = props;
  const { dismiss } = history.useDismissItem();

  const handleClick = () => {
    dismiss(itemId);
  };

  return (
    <Tooltip
      showDelay={2000}
      text="Dismiss this history item."
    >
      <Styled.DismissContainer onClick={handleClick}>
        <FaTrash />
      </Styled.DismissContainer>
    </Tooltip>
  );
};

export default Dismiss;
