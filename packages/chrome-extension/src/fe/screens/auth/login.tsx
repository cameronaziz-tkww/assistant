import { LoadingButton } from '@components/button';
import Input from '@components/input';
import { useErrors } from '@hooks';
import { runtime } from '@utils/chrome';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import * as Styled from '../styled';
import LoginError from './loginError';

interface LoginProps {
  unit: App.LoginUnit;
}

const Login: FunctionComponent<LoginProps> = (props) => {
  const { unit } = props;
  const [lastSubmit, setLastSubmit] = useState<App.AuthType | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [token, setToken] = useState<string>();
  const { sendId } = useErrors(unit);

  useEffect(
    () => {
      if (sendId === messageId) {
        setIsOAuthLoading(false);
      }
    },
    [sendId],
  );

  const handleTokenSubmit = () => {
    if (token) {
      setLastSubmit('pat');
      if (unit === 'github') {
        const id = runtime.send({ type: 'github/AUTHENTICATE_REQUEST', token });
        setMessageId(id);
        return;
      }
      const id = runtime.send({ type: 'jira/AUTHENTICATE_REQUEST', token });
      setMessageId(id);
    }
  };

  const handleOAuthClick = () => {
    setIsOAuthLoading(true);
    setLastSubmit('oauth');
    if (unit === 'github') {
      const id = runtime.send({ type: 'github/AUTHENTICATE_REQUEST' });
      setMessageId(id);
      return;
    }
    const id = runtime.send({ type: 'jira/AUTHENTICATE_REQUEST' });
    setMessageId(id);
  };

  const unitName = (unit: App.LoginUnit): string => {
    switch (unit) {
      case 'github': return 'Github';
      case 'jira': return 'Atlassian';
      default: return 'Service';
    }
  };

  return (
    <Fragment>
      <Styled.Section>
        <Styled.SectionTitle>
          Login
        </Styled.SectionTitle>
        <Styled.SectionContent flexRow>
          <Styled.SectionSubSection>
            <Styled.SectionSubTitle>
              OAuth
            </Styled.SectionSubTitle>
            <Styled.SectionSubContent>
              <LoadingButton
                block
                isLoading={isOAuthLoading}
                onClick={handleOAuthClick}
                size="lg"
              >
                Authorize through {unitName(unit)}
              </LoadingButton>
              {lastSubmit === 'oauth' &&
                <LoginError
                  messageId={messageId}
                  unit={unit}
                />
              }
            </Styled.SectionSubContent>
          </Styled.SectionSubSection>
          <Styled.SectionSubSection>
            <Styled.SectionSubTitle>
              Personal Access Token
            </Styled.SectionSubTitle>
            <Styled.SectionSubContent>
              <Input
                maxSize={50}
                onReactChange={setToken}
                inline
              />
              <LoadingButton
                onClick={handleTokenSubmit}
                isDisabled={!token || token.length === 0}
              >
                Submit
              </LoadingButton>
              {lastSubmit === 'pat' &&
                <LoginError
                  messageId={messageId}
                  unit={unit}
                />
              }
            </Styled.SectionSubContent>
          </Styled.SectionSubSection>

        </Styled.SectionContent>
      </Styled.Section>
    </Fragment>
  );
};

export default Login;
