import Unit from '@components/unit';
import { global } from '@hooks';
import React, { useEffect } from 'react';
import Center from './center';
import Github from './github';
import Global from './global';
import History from './history';
import Jira from './jira';

const Application: React.FunctionComponent = () => {
  const { init } = global.useRememberSelections();
  const { visibleUnits } = global.useUnits();
  const hasJira = visibleUnits.includes('jira');
  const hasGithub = visibleUnits.includes('github');
  const hasLinks = visibleUnits.includes('links');

  useEffect(
    () => {
      init();
    },
    [],
  );

  return (
    <Unit.Console>
      <Unit.Row hasLeft={hasJira} hasRight={hasGithub} columns={3}>
        <Jira isVisible={hasJira} />
        <Center showLinks={hasLinks} />
        <Github isVisible={hasGithub} />
      </Unit.Row>
      <History />
      <Global />
    </Unit.Console>
  );
};

export default Application;
