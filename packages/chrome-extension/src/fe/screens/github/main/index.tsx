import { useGithubTrackedState } from '@context/github';
import { useAuthStatus, useInit } from '@hooks/github';
import React, { Fragment, FunctionComponent, useEffect } from 'react';
import { Logout } from '../../auth';
import * as Styled from '../../styled';
import Repositories from './repositories';
import ReviewsRequired from './reviewsRequired';

const Main: FunctionComponent = () => {
  const { logout } = useAuthStatus();
  const { init } = useInit();
  const { hasInit } = useGithubTrackedState();

  useEffect(
    () => {
      if (!hasInit.includes('repositories')) {
        init('repositories');
      }
    },
    [],
  );

  return (
    <Fragment>
      <Logout handleClickLogout={logout} />
      <Styled.Section>
        <Styled.SectionTitle>
          Validation
        </Styled.SectionTitle>
        <Styled.SectionContent>
          <ReviewsRequired />
        </Styled.SectionContent>
        <Repositories />
      </Styled.Section>
    </Fragment>
  );
};

export default Main;
