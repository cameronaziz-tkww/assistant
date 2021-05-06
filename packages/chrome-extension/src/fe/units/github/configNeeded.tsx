import { Button } from '@components/button';
import { Loading } from '@components/loading';
import Unit from '@components/unit';
// import { useModalContext } from '@context';
import { useLoading } from '@hooks';
import { chrome } from '@utils';
import React, { Fragment, FunctionComponent } from 'react';
import styled from 'styled-components';

type Config = 'auth' | 'repos' | 'pat';

interface ConfigNeededProps {
  config: Config[];
}

interface ButtonContainerProps {
  item: Config;
  handleClick(config: Config): void;
}

const StyledButton = styled(Button)`
  margin: 10px auto;
`;

const getLabel = (config: Config): string => {
  if (config === 'auth') {
    return 'Authenticate via OAuth';
  }

  if (config === 'pat') {
    return 'Add Personal Access Token';
  }

  return 'Pick Repositories';
};

const ButtonContainer: FunctionComponent<ButtonContainerProps> = (props) => {
  const { item, handleClick } = props;

  const label = getLabel(item);

  const onClick = () => {
    handleClick(item);
  };

  return (
    <StyledButton onClick={onClick} size="lg">
      {label}
    </StyledButton>
  );
};

const ConfigNeeded: FunctionComponent<ConfigNeededProps> = (props) => {
  const { config } = props;
  // const { updateSelection } = useModalContext<App.Github.Selection>();
  const [repositoriesLoading] = useLoading('github-repositories');
  const [authLoading] = useLoading('github-repositories');

  const handleClick = (item: Config) => {
    if (item === 'auth') {
      chrome.runtime.send({ type: 'github/AUTHENTICATE_REQUEST' });
      return;
    }

    if (item === 'pat') {
      // updateSelection('pat');
      return;
    }

    if (item === 'repos') {
      // updateSelection('main');
    }
  };

  const loadingMessage = repositoriesLoading ? 'Loading Github Data' : 'Authenticating Github Account';
  const isLoading = authLoading || repositoriesLoading;

  return (
    <Unit.Content hasData={!isLoading}>
      {isLoading
        ?
        <Loading loadingMessage={loadingMessage} />
        :
        <Fragment>
          {config.map((item) => (
            <ButtonContainer key={item} handleClick={handleClick} item={item} />
          ))}
        </Fragment>
      }
    </Unit.Content>
  );
};

export default ConfigNeeded;
