import Pill from '@components/pill';
import { global } from '@hooks';
import { guards } from '@utils';
import React, { FunctionComponent } from 'react';

interface FeedItemTileProps {
  tile: App.History.Tile;
  feedItem: App.History.FeedItem;
}

const FeedItemTile: FunctionComponent<FeedItemTileProps> = (props) => {
  const { tile, feedItem } = props;
  const { dispatch } = global.useDispatchEvent();

  const navigate = (url: string) => {
    window.location.href = url;
  };

  const filter = () => {
    dispatch({
      unit: feedItem.app,
      full: tile.label,
      type: feedItem.type,
    });
  };

  const handleOnClick = () => {
    if (tile.url) {
      navigate(tile.url);
    }

    if (tile.isFilterable) {
      filter();
    }

  };

  const isClickable = tile.isFilterable || tile.url;

  return (
    <Pill
      nowrap
      noCursor={!isClickable}
      onClick={handleOnClick}
      opacity={!isClickable ? 0.4 : undefined}
      themeColor={typeof tile.level === 'string' && guards.isThemeColor(tile.level) ? tile.level : undefined}
      overrideBackground={typeof tile.level !== 'string' ? `#${tile.level.color}` : undefined}
      label={tile.label}
    />
  );
};

export default FeedItemTile;
