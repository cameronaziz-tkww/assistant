import Switch from '@components/switch';
import { links, useForceUpdate } from '@hooks';
import React, { FunctionComponent, useEffect } from 'react';
import * as Styled from '../styled';

interface ToggleProps {
  link: App.Links.Link;
  isBackgroundReverse: boolean;
}

const Toggle: FunctionComponent<ToggleProps> = (props) => {
  const { link, isBackgroundReverse } = props;
  const updateLink = links.useUpdateLink();
  const value = link.enabled ? 'enabled' : 'disabled';
  const force = useForceUpdate();

  useEffect(
    () => {
      force.update();
    },
    [],
  );

  const toggle = (choice: App.Links.EnabledChoice) => {
    updateLink({
      id: link.id,
      key: 'enabled',
      value: choice === 'enabled',
    });
  };

  const options: App.UI.SwitchOptions<App.Links.EnabledChoice> = [
    {
      value: 'enabled',
      label: 'Enable',
    },
    {
      value: 'disabled',
      label: 'Disable',
    },
  ];

  return (
    <Styled.Option>
      <Switch
        isBackgroundReverse={isBackgroundReverse}
        halfSize
        onChange={toggle}
        value={value}
        options={options}
      />
    </Styled.Option>
  );
};

export default Toggle;
