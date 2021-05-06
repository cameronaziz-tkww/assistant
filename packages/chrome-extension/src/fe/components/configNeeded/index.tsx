import React, { Fragment, FunctionComponent } from 'react';
import { chrome } from '../../../utils';
import { useLoading } from '../../hooks';
import { Loading } from '../loading';
import Unit from '../unit';
// import { useModalContext } from '@context';
import ButtonContainer, { ConfigItem } from './button';

type Config = 'auth' | 'repos' | 'pat';

interface ConfigNeededProps {
  config: Config[];
}

const getItem = (config: Config): ConfigItem => {
  if (config === 'auth') {
    return {
      label: 'Authenticate via OAuth',
      id: 'auth',
    };
  }

  if (config === 'pat') {
    return {
      label: 'Add Personal Access Token',
      id: 'pat',
    };
  }

  return {
    label: 'Pick Repositories',
    id: 'repos',
  };
};

const ConfigNeeded: FunctionComponent<ConfigNeededProps> = (props) => {
  const { config } = props;
  // const { updateSelection } = useModalContext<App.Github.Selection>();
  const [repositoriesLoading] = useLoading('github-repositories');
  const [authLoading] = useLoading('github-repositories');

  const handleClick = (item: ConfigItem) => {
    if (item.id === 'auth') {
      chrome.runtime.send({ type: 'github/AUTHENTICATE_REQUEST' });
      return;
    }

    if (item.id === 'pat') {
      // updateSelection('pat');
      return;
    }

    if (item.id === 'repos') {
      // updateSelection('main');
    }
  };

  const loadingMessage = repositoriesLoading ? 'Loading Github Data' : 'Authenticating Github Account';
  const isLoading = repositoriesLoading || authLoading;
  return (
    <Unit.Content hasData={!isLoading}>
      {isLoading
        ?
        <Loading loadingMessage={loadingMessage} />
        :
        <Fragment>
          {config.map((item) => (
            <ButtonContainer key={item} handleClick={handleClick} item={getItem(item)} />
          ))}
        </Fragment>
      }
    </Unit.Content>
  );
};

export default ConfigNeeded;
