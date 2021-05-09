import Unit from '@components/unit';
import { useHistoryTrackedState } from '@context/history';
import { global, history } from '@hooks';
import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import Feed from './feed';
import Sidebar from './sidebar';
import * as Styled from './styled';

const Wrapper: FunctionComponent = () => {
  const { visibleUnits, setVisibleUnit } = global.useUnits();
  const { init, feed } = history.useFeed();
  const { hasInit } = useHistoryTrackedState();
  const [isHidden, setIsHidden] = useState(true);
  const [isTease, setIsTease] = useState(false);
  const hasHistory = visibleUnits.includes('history');
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
      if (hasHistory && !hasInit.includes('feed')) {
        init();
      }
    },
    [hasHistory],
  );

  const hide = () => {
    setIsHidden(true);
    setVisibleUnit('history', false);
  };

  const onMouseEnter = () => {
    if (isHidden) {
      setIsTease(true);
    }
  };

  const onMouseLeave = () => {
    if (isHidden) {
      setIsTease(false);
    }
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      show();
    }
  };

  const show = () => {
    setVisibleUnit('history', true);
    if (isHidden) {
      setIsTease(false);
      setIsHidden(false);
    }
  };

  return (
    <Styled.Container
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      isHidden={isHidden}
      isTease={isTease}
    >
      <Unit.Title
        text="History"
        icon={Styled.HistoryIcon}
        rotated
      />
      <Sidebar isHidden={isHidden} hide={hide} />
      <Feed show={show} isHidden={isHidden} />
    </Styled.Container>
  );
};

export default Wrapper;
