import Unit from '@components/unit';
import { history } from '@hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
import Feed from './feed';
import Sidebar from './sidebar';
import * as Styled from './styled';

const Wrapper: FunctionComponent = () => {
  const { init, feed } = history.useFeed();
  const [isHidden, setIsHidden] = useState(true);
  const [isTease, setIsTease] = useState(false);
  const hasFeed = feed.length > 0;

  useEffect(
    () => {
      if (isHidden && hasFeed) {
        setIsHidden(false);
      }
    },
    [feed.length],
  );

  useEffect(
    () => {
      init();
    },
    [],
  );

  const hide = () => {
    setIsHidden(true);
  };

  const onMouseEnter = () => {
    if (isHidden && hasFeed) {
      setIsTease(true);
    }
  };

  const onMouseLeave = () => {
    if (isHidden && hasFeed) {
      setIsTease(false);
    }
  };

  const onClick = () => {
    if (isHidden && hasFeed) {
      setIsTease(false);
      setIsHidden(false);
    }
  };

  return (
    <Styled.Container
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      hasHistory={hasFeed}
      isHidden={isHidden}
      isTease={isTease}
    >
      <Unit.Title
        text="History"
        icon={Styled.HistoryIcon}
        rotated
      />
      <Sidebar hide={hide} />
      <Feed isHidden={isHidden} />
    </Styled.Container>
  );
};

export default Wrapper;
