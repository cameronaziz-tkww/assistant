import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Button } from '../button';

const StyledButton = styled(Button)`
  margin: 10px auto;
`;

export interface ConfigItem {
  label: string;
  id: string;
}

interface ButtonContainerProps {
  item: ConfigItem;
  handleClick(item: ConfigItem): void;
}

const ButtonContainer: FunctionComponent<ButtonContainerProps> = (props) => {
  const { item, handleClick } = props;

  const onClick = () => {
    handleClick(item);
  };

  return (
    <StyledButton onClick={onClick} size="lg">
      {item.label}
    </StyledButton>
  );
};

export default ButtonContainer;
