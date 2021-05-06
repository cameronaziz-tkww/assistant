import { history } from '@hooks';
import React, { FunctionComponent } from 'react';
import FeedItem from './feedItem';
import * as Styled from './styled';

interface FeedProps {
  isHidden: boolean;
}

const Feed: FunctionComponent<FeedProps> = (props) => {
  const { isHidden } = props;
  const { feed } = history.useFeed();

  return (
    <Styled.FeedContainer isHidden={isHidden}>
      {feed.map((feedItem) =>
        <FeedItem key={feedItem.id} feedItem={feedItem} />,
      )}
    </Styled.FeedContainer>
  );
};

export default Feed;
