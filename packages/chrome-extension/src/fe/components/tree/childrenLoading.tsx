import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface ChildrenLoadingProps {
  mayHaveChildren?: boolean;
  level: number;
  loadingMessage?: string;
  noChildrenMessage?: string;
  isLoading?: boolean;
  hasNoChildren?: boolean;
}

const ChildrenLoading: FunctionComponent<ChildrenLoadingProps> = (props) => {
  const { mayHaveChildren, level, loadingMessage, noChildrenMessage, hasNoChildren } = props;

  if (!mayHaveChildren) {
    return null;
  }

  if (hasNoChildren) {
    return (
      <Styled.ChildWrapper noBorder isEven={level % 2 === 0}>
        <Styled.BlankContainer italics level={level}>
          {noChildrenMessage || 'No Results Found'}
        </Styled.BlankContainer>
      </Styled.ChildWrapper>
    );
  }

  return (
    <Styled.ChildWrapper noBorder isEven={level % 2 === 0}>
      <Styled.BlankContainer italics level={level}>
        {loadingMessage || 'Loading'}
      </Styled.BlankContainer>
    </Styled.ChildWrapper>
  );
};

export default ChildrenLoading;
