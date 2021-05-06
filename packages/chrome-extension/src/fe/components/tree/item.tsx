import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import Caret from './caret';
import * as Styled from './styled';
import Subtext from './subtext';

export interface ItemProps {
  item: App.UI.TreeItem;
  level: number;
  path: App.UI.IdPath;
  index: number;
  isRoot: boolean;
  hasOnSelect: boolean;
  handleOnClick(itemIdPath: App.UI.IdPath, newStateOpen: boolean): void;
  handleOnSelect(itemIdPath: App.UI.IdPath, id: string | number): void;
  mayHaveChildren: boolean;
}

const Item: FunctionComponent<ItemProps> = (props) => {
  const { item, level, isRoot, hasOnSelect, mayHaveChildren, handleOnClick, handleOnSelect, path, children } = props;
  const { isSelected, label, childItems, breakAfter, id, loading, subtext } = item;
  const [isActive, setIsActive] = useState<boolean>(!!isSelected && !!mayHaveChildren);
  const [itemIsSelected, setItemIsSelected] = useState<boolean>(isSelected || false);
  const currentPath = [...path, id];

  useEffect(
    () => {
      if (isSelected !== itemIsSelected) {
        setItemIsSelected(isSelected || false);
      }
    },
    [isSelected],
  );

  const toggle = (force?: boolean) => {
    const change = typeof force === 'undefined' ? !isActive : force;
    if (childItems || loading?.mayHaveChildren || typeof force !== 'undefined') {
      setIsActive(change);
    }
  };

  const selectItem = () => {
    setItemIsSelected(!itemIsSelected);
    handleOnSelect(currentPath, item.id);
  };

  const caretSelect = hasOnSelect ? selectItem : undefined;

  const itemClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleOnClick(currentPath, !isActive);

    if (caretSelect && !childItems && !loading?.mayHaveChildren) {
      selectItem();
      return;
    }

    toggle();
  };

  return (
    <Styled.ItemContainer level={level}>
      <Styled.Item
        onClick={itemClick}
        isClickable={hasOnSelect || !!childItems}
      >
        <Caret
          mayHaveChildren={loading?.mayHaveChildren}
          isSelected={itemIsSelected}
          onSelect={caretSelect}
          isActive={!!isActive}
          hasChildren={!!childItems}
          label={label}
        />
        {subtext && <Subtext subtext={subtext} />}
      </Styled.Item>
      <Styled.ItemChildren hasPadding={!isRoot && !!isActive && !isSelected}>
        {isActive && children}
      </Styled.ItemChildren>
      {breakAfter &&
        <Styled.Break />
      }
    </Styled.ItemContainer>
  );
};

export default Item;
