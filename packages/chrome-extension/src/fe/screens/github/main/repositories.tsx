import { github } from '@hooks';
import React, { Fragment, FunctionComponent } from 'react';
import * as Styled from '../../styled';
import RepositoryList from './repositoryList';

const Repositories: FunctionComponent = () => {
  const {
    repositories: {
      watched,
      unwatched,
    },
  } = github.useRepositories();

  return (
    <Fragment>
      <Styled.SectionTitle>
        Repositories
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <Styled.RepositoryListsWrapper>
          <RepositoryList
            type="watched"
            repositories={watched}
            title="Currently Watched Repositories"
            loadingMessage={unwatched.length === 0 ? 'Fetching Repositories' : 'Add Repos to Watch'}
          />
          <RepositoryList
            type="unwatched"
            repositories={unwatched}
            title="Unwatched Repositories"
            loadingMessage="Fetching Repositories"
          />
        </Styled.RepositoryListsWrapper>
      </Styled.SectionContent>
    </Fragment>
  );
};

export default Repositories;
