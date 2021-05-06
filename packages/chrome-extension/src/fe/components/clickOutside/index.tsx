import React, { FunctionComponent, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface ClickOutsideProps {
  live?: boolean;
  onClickOutside(event: MouseEvent): void;
}

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const ClickOutside: FunctionComponent<ClickOutsideProps> = (props) => {
  const { onClickOutside, live } = props;
  const fullScreenRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (fullScreenRef.current) {
        fullScreenRef.current.addEventListener('click', clickOutside);
      }

      return () => {
        if (fullScreenRef.current) {
          fullScreenRef.current.removeEventListener('click', clickOutside);
        }
      };
    },
    [],
  );

  const clickOutside = (event: MouseEvent) => {
    onClickOutside(event);
  };

  if (!live) {
    return null;
  }

  return (
    <Container ref={fullScreenRef} />
  );
};

export default ClickOutside;
