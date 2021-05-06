import React, { FunctionComponent, useEffect, useState } from 'react';
import { List } from 'react-virtualized';
import Loading from './loading';
import Repo from './repo';
import * as Styled from './styled';

interface RepositoryListProps {
  repositories: App.Github.Repository[];
  title: string;
  loadingMessage: string;
  type: 'unwatched' | 'watched'
}

const RepositoryList: FunctionComponent<RepositoryListProps> = (props) => {
  const { repositories, type, loadingMessage, title } = props;
  const [count, setCount] = useState(0);

  useEffect(
    () => {

      const cancel = setInterval(
        () => {
          setCount(count + 1);
        },
        300,
      );

      return () => {
        clearInterval(cancel);
      };

    },
    [],
  );

  return (
    <Styled.RepoListContainer>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Repos>
        <List
          noRowsRenderer={() => <Loading message={loadingMessage} />}
          height={200}
          width={300}
          rowHeight={20}
          rowCount={repositories.length}
          rowRenderer={({ index, style, key }) => (
            <Repo
              key={key}
              style={style}
              repository={repositories[index]}
              type={type}
            />
          )}
        />
      </Styled.Repos>
    </Styled.RepoListContainer>
  );
};

export default RepositoryList;
