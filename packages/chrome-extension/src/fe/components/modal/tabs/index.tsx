import React, { FunctionComponent, useState } from 'react';
import * as Styled from './styled';
import Tab from './tab';

const tabs: App.Tab[] = [
  {
    screen: 'links',
    label: 'Links',
  },
  {
    screen: 'jira',
    label: 'Jira',
  },
  {
    screen: 'github',
    label: 'Github',
  },
  {
    screen: 'honeybadger',
    label: 'Honeybadger',
  },
  {
    screen: 'global',
    label: 'Settings',
  },
];

const Tabs: FunctionComponent = () => {
  const [selectedTab, setSelectedTab] = useState<App.SettingsTab>();

  const handleClick = (screen: App.SettingsTab) => {
    setSelectedTab(screen);
  };

  return (
    <Styled.Container>
      {tabs.map((tab) =>
        <Tab
          {...tab}
          key={tab.screen}
          handleClick={handleClick}
          isSelected={tab.screen === selectedTab}
        />,
      )}
    </Styled.Container>
  );
};

export default Tabs;
