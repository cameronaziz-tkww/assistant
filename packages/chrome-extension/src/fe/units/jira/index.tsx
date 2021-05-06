import { Portal } from '@components/modal';
import { UnitProps } from '@components/unit';
import { jira } from '@context';
import { JiraScreen } from '@screens';
import React, { FunctionComponent } from 'react';
import Wrapper from './wrapper';

const Jira: FunctionComponent<UnitProps> = (props) => {
  const { isVisible } = props;

  // const handleCreateClick = () => {
  //   // window.location.href = url;
  // };

  // const handleMenuClick = (item: App.Menu.SelectOption<string>) => {
  //   // const url = `${JIRA_BASE_URL}/secure/CreateIssueDetails!init.jspa?pid=${item.value}`;
  //   // window.location.href = url;
  // };

  // const menuConfigurations: App.Menu.Configurations = {
  //   left: [
  //     {
  //       id: 'create',
  //       icon: IoMdCreate,
  //       handleClick: handleCreateClick,
  //       // dropdown: {
  //       //   handleClick: handleMenuClick,
  //       //   title: 'Select a Project',
  //       //   // options: createOptions,
  //       //   footerOptions: [
  //       //     {
  //       //       label: 'Always Select',
  //       //       value: 'select',
  //       //     },
  //       //   ],
  //       // },
  //     },
  //   ],
  // };

  return (
    <jira.Provider>
      {isVisible &&
        <Wrapper />
      }
      <Portal selectionTrigger="jira">
        <JiraScreen />
      </Portal>
    </jira.Provider>
  );
};

export default Jira;
