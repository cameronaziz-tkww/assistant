import Unit from '@components/unit';
import { global } from '@hooks';
import React from 'react';
import Center from './center';
import Github from './github';
import Global from './global';
import History from './history';
import Jira from './jira';

const Application: React.FunctionComponent = () => {
  const { visibleUnits } = global.useUnits();
  const hasJira = visibleUnits.includes('jira');
  const hasGithub = visibleUnits.includes('github');
  const hasHistory = visibleUnits.includes('history');
  const hasLinks = visibleUnits.includes('links');

  return (
    <Unit.Console>
      <Unit.Row hasLeft={hasJira} hasRight={hasGithub} columns={3}>
        <Jira isVisible={hasJira} />
        <Center showLinks={hasLinks} />
        <Github isVisible={hasGithub} />
      </Unit.Row>
      <History isVisible={hasHistory} />
      <Global />
    </Unit.Console>
  );
};

export default Application;
