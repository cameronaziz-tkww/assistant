import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';

interface CursorProps {
  size: number,
  isVisible?: boolean;
}

interface ContainerProps {
  size: number;
  isVisible?: boolean;
}

const Container = styled.div<ContainerProps>`
  display: inline-block;
  position: relative;
  top: 2px;
  height: ${(props) => props.size}px;
  padding-top: ${(props) => props.size / 10}px;
  width: 3px;
  opacity: ${(props) => props.isVisible ? '100%' : '9%'};
`;

const Item = styled.div`
  height: 100%;
  width: 100%;
  background-color: #fff;
`;

const Cursor: FunctionComponent<CursorProps> = (props) => {
  const { size, isVisible } = props;
  const [visible, setVisible] = useState(true);

  useEffect(
    () => {
      const cancel = setInterval(
        () => {
          setVisible(!visible);
        },
        500,
      );
      return () => {
        clearInterval(cancel);
      };
    },
  );

  if (isVisible === false) {
    return null;
  }

  return (
    <Container
      size={size}
      isVisible={visible}
    >
      <Item />
    </Container>
  );
};

export default Cursor;
