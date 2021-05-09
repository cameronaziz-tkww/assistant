import { SearchInput } from '@components/input';
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
    filter,
  } = github.useRepositories();

  const handleSearchChange = (value: string) => {
    filter(value);
  };

  const clearSearch = () => {
    filter('');
  };

  return (
    <Fragment>
      <Styled.SectionTitleContainer>
        <Styled.SectionTitle>
          Repositories
        </Styled.SectionTitle>
        <SearchInput
          onReactChange={handleSearchChange}
          clearSearch={clearSearch}
        />
      </Styled.SectionTitleContainer>
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
