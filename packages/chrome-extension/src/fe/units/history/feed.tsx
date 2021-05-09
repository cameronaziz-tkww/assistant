import { history } from '@hooks';
import React, { FunctionComponent } from 'react';
import FeedItem from './feedItem';
import * as Styled from './styled';

interface FeedProps {
  isHidden: boolean;
  show(): void;
}

const Feed: FunctionComponent<FeedProps> = (props) => {
  const { isHidden, show } = props;
  const { feed } = history.useFeed();

  const handleClick = () => {
    if (isHidden) {
      show();
    }
  };

  return (
    <Styled.FeedContainer onClick={handleClick} isHidden={isHidden}>
      {feed.map((feedItem) =>
        <FeedItem key={feedItem.id} feedItem={feedItem} />,
      )}
    </Styled.FeedContainer>
  );
};

export default Feed;
