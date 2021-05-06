import React, { FunctionComponent } from 'react';
import FeedItemTile from './feedItemTile';
import * as Styled from './styled';

interface FeedItemProps {
  feedItem: App.History.FeedItem
}

const FeedItem: FunctionComponent<FeedItemProps> = (props) => {
  const { feedItem } = props;

  return (
    <Styled.FeedItem
      minContent
      background="grey-light"
      foreground="grey-dark"
    >
      {feedItem.message.map((message, index) => {
        if (typeof message === 'string') {
          return (
            <Styled.FeedItemMessage
              key={`${message}-${index}`}
            >
              {message}
            </Styled.FeedItemMessage>
          );
        }
        return (
          <FeedItemTile
            feedItem={feedItem}
            key={`${message.label}-${index}`}
            tile={message}
          />
        );
      })}
    </Styled.FeedItem>
  );
};

export default FeedItem;
