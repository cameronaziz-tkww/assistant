import produce from 'immer';
import React, { FunctionComponent, useEffect, useState } from 'react';
import * as Styled from './styled';
import TreeContainer from './tree';

interface TreeProps {
  items: App.UI.TreeItem[];
  loadingMessage?: string;
  noChildrenMessage?: string;
  mayHaveChildren?: boolean;
  onClick?(itemIdPath: App.UI.IdPath, nextStateOpen: boolean): void;
  onSelect?(itemIdPath: App.UI.IdPath, nextStateSelected: boolean): void;
}

export const Tree: FunctionComponent<TreeProps> = (props) => {
  const { onSelect, onClick, items, loadingMessage, ...rest } = props;
  const [childItems, setChildItems] = useState(items || []);

  useEffect(
    () => {
      setChildItems(items);
    },
    [items],
  );

  const findNode = (itemIdPath: App.UI.IdPath, nodes: App.UI.TreeItem[]) => {
    const path = [...itemIdPath];
    let node: App.UI.TreeItem[] | undefined = nodes;
    while (path.length > 1 && node && node.length > 0) {
      const currentPath = path.shift();
      const children = node.find((child) => child.id === currentPath);
      const rightItems = children.rightChildItems ? children.rightChildItems : [];
      node = [...children.childItems, ...rightItems];
    }
    return node;
  };

  const handleOnSelect = (itemIdPath: App.UI.IdPath, id: number | string) => {
    if (onSelect) {
      const node = findNode(itemIdPath, childItems);
      if (node) {
        const index = node.findIndex((i) => i.id === id);
        const nextStateSelected = !node[index].isSelected;
        onSelect(itemIdPath, nextStateSelected);
      }
    }
    const nextChildItems = produce(
      childItems,
      (draft) => {
        const node = findNode(itemIdPath, draft);
        if (node) {
          const index = node.findIndex((i) => i.id === id);
          node[index].isSelected = !node[index].isSelected;
        }
      },
    );
    setChildItems(nextChildItems);
  };

  const handleOnClick = (itemIdPath: App.UI.IdPath, newStateOpen: boolean) => {
    if (onClick) {
      onClick(itemIdPath, newStateOpen);
    }
  };

  return (
    <Styled.Wrapper>
      <TreeContainer
        isRoot
        loadingMessage={loadingMessage}
        handleOnClick={handleOnClick}
        items={childItems}
        hasOnSelect={!!onSelect}
        level={0}
        path={[]}
        handleOnSelect={handleOnSelect}
        {...rest}
      />
    </Styled.Wrapper>
  );
};

export default Tree;
