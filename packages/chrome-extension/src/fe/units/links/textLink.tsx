import Loading from '@components/loading';
import { Identifier } from 'dnd-core';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface TextLinkProps {
  linkConfig: App.Links.Config;
  isDragging: boolean;
  handlerId: Identifier | null;
  isFocused: boolean;
}

const TextLink = forwardRef<HTMLDivElement, TextLinkProps>((props, ref) => {
  const { isDragging, isFocused, handlerId, linkConfig } = props;
  const { label, hotkey, url } = linkConfig.link;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        if (clientWidth > 30) {
          setScale(30 / clientWidth);
        }
      }
    },
    [containerRef],
  );

  const navigate = () => {
    if (!isLoading) {
      setIsLoading(true);
      window.location.href = url;
    }
  };

  return (
    <Styled.ButtonBase
      ref={ref}
      data-handler-id={handlerId}
      isDragging={isDragging}
      onClick={navigate}
    >
      {hotkey && isFocused &&
        <Styled.Hotkey>
          {hotkey}
        </Styled.Hotkey>
      }
      <Styled.LettersWrapper>
        {isLoading ?
          <Loading
            speed={0.8}
            type="line"
          />
          :
          <Styled.LettersContainer scale={scale} ref={containerRef}>
            {label}
          </Styled.LettersContainer>
        }
      </Styled.LettersWrapper>
    </Styled.ButtonBase>
  );
});

export default TextLink;
