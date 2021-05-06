import Loading from '@components/loading';
import { Identifier } from 'dnd-core';
import React, { forwardRef, useEffect, useState } from 'react';
import * as Styled from './styled';

interface SVGLinkProps {
  link: App.Links.StandardBuiltConfig;
  isDragging: boolean;
  handlerId: Identifier | null;
  isFocused: boolean;
}

const SVGLink = forwardRef<HTMLDivElement, SVGLinkProps>((props, ref) => {
  const { isDragging, isFocused, handlerId, link } = props;
  const { svg, hotkey, url } = link;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      setIsLoading(link.isLoading || false);
    },
    [link.isLoading],
  );

  const navigate = () => {
    if (!isLoading) {
      setIsLoading(true);
      window.location.href = url;
    }
  };

  return (
    <Styled.ImageContainer
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
      {isLoading ?
        <Styled.LettersWrapper>
          <Loading
            speed={0.5}
            type="line"
          />
        </Styled.LettersWrapper>
        :
        <Styled.Image src={svg} />
      }
    </Styled.ImageContainer>
  );
});

export default SVGLink;
