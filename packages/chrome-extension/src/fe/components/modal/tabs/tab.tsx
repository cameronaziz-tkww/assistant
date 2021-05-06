import { modal as modalContext } from '@context';
import { modal } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface TabProps {
  screen: App.SettingsTab;
  label: string;
  handleClick(unit: App.SettingsTab): void;
  isSelected: boolean;
}

const Tab: FunctionComponent<TabProps> = (props) => {
  const { screen, label, handleClick } = props;
  const { selection } = modalContext.useTrackedState();
  const update = modal.useUpdate();

  const onClick = () => {
    update.selection(screen);
    handleClick(screen);
  };

  return (
    <Styled.Tab
      isSelected={selection === screen}
      onClick={onClick}
    >
      {label}
    </Styled.Tab>
  );
};

export default Tab;
