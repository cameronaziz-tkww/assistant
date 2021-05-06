import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

type Type = 'line' | 'balls';

interface LoadingProps {
  type?: Type;
  isLoading?: boolean;
  height?: string;
  width?: string;
  loadingMessage?: string;
  speed?: number;
}

export const Loading: FunctionComponent<LoadingProps> = (props) => {
  const { type, isLoading, height, width, loadingMessage, speed } = props;

  if (typeof isLoading !== 'undefined' && !isLoading) {
    return null;
  }

  const Icon = type === 'line' ? Styled.Line : Styled.Balls;

  return (
    <Styled.IconContainer>
      <Icon height={height} width={width} speed={speed} />
      {loadingMessage &&
        <div>
          {loadingMessage}
        </div>
      }
    </Styled.IconContainer>
  );
};

export default Loading;
