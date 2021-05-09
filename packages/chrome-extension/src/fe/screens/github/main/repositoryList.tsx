import React, { FunctionComponent, useRef } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import Loading from './loading';
import Repo from './repo';
import * as Styled from './styled';

interface RepositoryListProps {
  repositories: App.Github.Repository[];
  title: string;
  loadingMessage: string;
  type: 'unwatched' | 'watched'
}

const createCache = () =>
  new CellMeasurerCache({
    fixedHeight: false,
    fixedWidth: true,
    defaultHeight: 20,
  });

const RepositoryList: FunctionComponent<RepositoryListProps> = (props) => {
  const { repositories, type, loadingMessage, title } = props;
  const cacheRef = useRef(createCache());

  return (
    <Styled.RepoListContainer>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Repos>
        <AutoSizer>
          {({ width, height }) =>
            <List
              noRowsRenderer={() => <Loading message={loadingMessage} />}
              height={height}
              deferredMeasurementCache={cacheRef.current}
              width={width}
              rowHeight={cacheRef.current.rowHeight}
              rowCount={repositories.length}
              rowRenderer={({ index, parent, style }) => (
                <CellMeasurer
                  key={repositories[index].id}
                  parent={parent}
                  cache={cacheRef.current}
                  columnIndex={0}
                  rowIndex={index}
                >
                  <Repo
                    style={style}
                    repository={repositories[index]}
                    type={type}
                  />
                </CellMeasurer>
              )}
            />
          }
        </AutoSizer>
      </Styled.Repos>
    </Styled.RepoListContainer>
  );
};

export default RepositoryList;
