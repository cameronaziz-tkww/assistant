import React, { FunctionComponent, HTMLAttributes, useEffect, useRef, useState } from 'react';
import Progress from '../progress';
import * as Styled from './styled';

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  center?: boolean;
  hideProgress?: boolean;
  hasData: boolean;
}

const Content: FunctionComponent<ContentProps> = (props) => {
  const { hideProgress, hasData, children, ...rest } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(
    () => {
      if (contentRef.current) {
        contentRef.current.addEventListener('scroll', scroll);
      }

      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('scroll', scroll);
        }
      };
    },
    [contentRef],
  );

  const scroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const height = scrollHeight - clientHeight;
      const scrolled = (scrollTop / height) * 100;
      setPercent(scrolled);
    }
  };

  return (
    <Styled.ContentValue hasData={hasData}>
      <Progress hide={hideProgress} percent={percent} />
      <Styled.ContentContainer ref={contentRef} {...rest}>
        {children}
      </Styled.ContentContainer>
    </Styled.ContentValue>
  );
};

export default Content;
