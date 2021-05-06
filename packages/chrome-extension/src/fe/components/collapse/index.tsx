import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface ContainerProps {
  elementHeight: number;
  isOpen: boolean;
  hasOpened: boolean;
}

const TIME = 500;

const Container = styled.div<ContainerProps>`
  overflow-y: ${({ hasOpened }) => hasOpened ? 'unset' : 'hidden'};
  transition: max-height ${TIME}ms;
  max-height: ${({ isOpen, elementHeight }) => isOpen ? `${elementHeight}px` : 0};
`;

interface CollapseProps {
  isOpen: boolean;
}

const Collapse: FunctionComponent<CollapseProps> = (props) => {
  const { isOpen, children } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementHeight, setElementHeight] = useState(0);
  const [hasOpened, setHasOpened] = useState(isOpen);

  useEffect(
    () => {
      if (containerRef.current) {
        const { scrollHeight } = containerRef.current;
        setElementHeight(scrollHeight);
      }
    },
    [containerRef],
  );

  useEffect(
    () => {
      const timeout = setTimeout(
        () => {
          setHasOpened(isOpen);
        },
        TIME,
      );

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    },
    [isOpen],
  );

  return (
    <Container
      ref={containerRef}
      isOpen={isOpen}
      hasOpened={hasOpened}
      elementHeight={elementHeight}
    >
      {children}
    </Container>
  );
};

export default Collapse;
