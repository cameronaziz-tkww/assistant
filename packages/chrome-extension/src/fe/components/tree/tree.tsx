import React, { Fragment, FunctionComponent, ReactNode } from 'react';
import ChildrenLoading from './childrenLoading';
import Item from './item';
import * as Styled from './styled';

export interface TreeProps {
  items: App.UI.TreeItem[];
  level: number;
  isRoot?: boolean;
  path: App.UI.IdPath;
  hasOnSelect: boolean;
  mayHaveChildren?: boolean;
  loadingMessage?: string;
  noChildrenMessage?: string;
  handleOnClick(itemIdPath: App.UI.IdPath, newStateOpen: boolean): void;
  handleOnSelect(itemIdPath: App.UI.IdPath, id: string | number): void;
}

interface ChildrenProps {
  handleOnClick(itemIdPath: App.UI.IdPath, newStateOpen: boolean): void;
  handleOnSelect(itemIdPath: App.UI.IdPath, id: string | number): void;
  hasOnSelect: boolean;
  loading?: App.UI.TreeLoading
  childrenNodes?: boolean;
  title?: string;
  items: (App.UI.TreeItem | ReactNode)[];
  isRoot?: boolean;
  loadingMessage?: string;
  level: number;
  noChildrenMessage?: string;
  path: (string | number)[];
}

const Children: FunctionComponent<ChildrenProps> = (props) => {
  const { items, title, loading, childrenNodes, noChildrenMessage, loadingMessage, isRoot, level, path, handleOnClick, handleOnSelect, hasOnSelect } = props;

  if (items.length > 0) {
    return (
      <Styled.TreeWrapperContainer>
        {title &&
          <Styled.ChildTitle>
            {title}
          </Styled.ChildTitle>
        }
        <Styled.TreeWrapper isEven={level % 2 === 0}>
          {childrenNodes ?
            items.map((child) =>
              <Fragment>
                {child}
              </Fragment>,
            )
            :
            <Tree
              path={path}
              handleOnSelect={handleOnSelect}
              hasOnSelect={hasOnSelect}
              handleOnClick={handleOnClick}
              level={level + 1}
              items={items as App.UI.TreeItem[] || []}
            />
          }
        </Styled.TreeWrapper>
      </Styled.TreeWrapperContainer>
    );
  }
  return (
    <ChildrenLoading
      level={level}
      mayHaveChildren={isRoot || loading?.mayHaveChildren}
      loadingMessage={loadingMessage}
      noChildrenMessage={noChildrenMessage}
      isLoading={loading?.isLoading}
      hasNoChildren={loading?.hasNoChildren}
    />
  );
};

const Tree: FunctionComponent<TreeProps> = (props) => {
  const { items, level, isRoot, hasOnSelect, noChildrenMessage, loadingMessage, handleOnSelect, handleOnClick, path } = props;
  const currentPath = (id: string | number) => [...path, id];

  return (
    <Styled.TreeContainer>
      {items && items.map((item, index) =>
        <Item
          path={path}
          handleOnSelect={handleOnSelect}
          key={index}
          index={index}
          isRoot={!!isRoot}
          item={item}
          hasOnSelect={hasOnSelect}
          handleOnClick={handleOnClick}
          level={level}
          mayHaveChildren={item.loading?.mayHaveChildren || !!(item.childItems && item.childItems.length > 0)}
        >
          <Styled.ChildWrapper isEven={level % 2 === 0}>
            {item.childItems &&
              <Children
                items={item.childItems}
                handleOnClick={handleOnClick}
                handleOnSelect={handleOnSelect}
                hasOnSelect={hasOnSelect}
                loading={item.loading}
                childrenNodes={item.childrenNodes}
                title={item.childItemsTitle}
                isRoot={isRoot}
                loadingMessage={loadingMessage}
                level={level}
                noChildrenMessage={noChildrenMessage}
                path={currentPath(item.id)}
              />
            }
            {item.rightChildItems &&
              <Children
                items={item.rightChildItems}
                handleOnClick={handleOnClick}
                handleOnSelect={handleOnSelect}
                hasOnSelect={hasOnSelect}
                loading={item.loading}
                childrenNodes={item.childrenNodes}
                title={item.rightChildItemsTitle}
                isRoot={isRoot}
                level={level}
                noChildrenMessage={noChildrenMessage}
                path={currentPath(item.id)}
              />
            }
          </Styled.ChildWrapper>
        </Item>,
      )}
      {items.length === 0 && isRoot && loadingMessage &&
        <ChildrenLoading
          level={1}
          mayHaveChildren
          loadingMessage={loadingMessage}
          noChildrenMessage={noChildrenMessage}
          isLoading
        />
      }
    </Styled.TreeContainer>
  );
};

export default Tree;
