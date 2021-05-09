import { Portal } from '@components/modal';
import { UnitProps } from '@components/unit';
import { jira } from '@context';
import { JiraScreen } from '@screens';
import React, { FunctionComponent } from 'react';
import Container from './container';

const Jira: FunctionComponent<UnitProps> = (props) => {
  const { isVisible } = props;

  return (
    <jira.Provider>
      {isVisible &&
        <Container />
      }
      <Portal selectionTrigger="jira">
        <JiraScreen />
      </Portal>
    </jira.Provider>
  );
};

export default Jira;
