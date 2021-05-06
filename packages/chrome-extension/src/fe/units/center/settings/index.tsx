import { modal as modalContext } from '@context';
import { modal } from '@hooks';
import React, { FunctionComponent, MouseEvent } from 'react';
import { VscSettingsGear } from 'react-icons/vsc';
import * as Styled from './styled';

const Settings: FunctionComponent = () => {
  const update = modal.useUpdate();
  const { hiddenUnits } = modalContext.useTrackedState();

  const handleSettingsClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    update.selection('links');
  };

  if (hiddenUnits.includes('settings-icon')) {
    return null;
  }

  return (
    <Styled.Container onClick={handleSettingsClick}>
      <VscSettingsGear />
    </Styled.Container>
  );
};

export default Settings;
