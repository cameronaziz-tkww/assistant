import { Button } from '@components/button';
import React, { Fragment, FunctionComponent } from 'react';
import * as Styled from '../../styled';

const Title: FunctionComponent = () => {
  // const { loginName, logout } = useContext(GithubContext);
  // const { updateSelection } = useModalContext<App.Github.Selection>();

  // const handleLogin = () => {
  //   updateSelection('pat');
  // };

  return (
    <Fragment>
      <Styled.SectionSubTitle>
        Active User
      </Styled.SectionSubTitle>
      <Styled.SectionSubContent>

        <Button themeColor="primary" size="xs" onClick={() => { /* do nothing */ }}>
          Logout
        </Button>
      </Styled.SectionSubContent>
    </Fragment >
  );
};

export default Title;
