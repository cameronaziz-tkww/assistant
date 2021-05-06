import Switch from '@components/switch';
import { links } from '@hooks';
import React, { forwardRef, Fragment, PropsWithChildren, useState } from 'react';
import * as Styled from '../../styled';

interface ButtonLabelProps {
  update<T extends keyof App.Links.StandardConfig>(key: T, value: App.Links.StandardConfig[T]): void;
  link: App.Links.StandardConfig
}

const ButtonLabel = forwardRef<HTMLLabelElement, PropsWithChildren<ButtonLabelProps>>((props, ref) => {
  const { link, update } = props;
  const { standard } = links.useLinks();
  const settings = link || {} as Partial<App.Links.StandardConfig>;
  const [label, setLabel] = useState<App.Links.ButtonChoice>(settings.buttonChoice || 'icon');

  const onChangeButtonLabel = (value: App.Links.ButtonChoice) => {
    setLabel(value);
    update('buttonChoice', value);
  };

  const config = standard.find((item) => item.id === link.id);

  if (!config) {
    return null;
  }

  return (
    <Fragment>
      <Styled.OptionTitle ref={ref}>
        Button
      </Styled.OptionTitle>
      <Styled.OptionSwitch>
        <Switch<App.Links.ButtonChoice>
          halfSize
          isDisabled={!config.enabled}
          onChange={onChangeButtonLabel}
          value={label}
          options={[
            {
              value: 'icon',
              label: config.svg,
              isIcon: true,
            },
            {
              value: 'letter',
              label: 'Letters',
            },
          ]}
        />
      </Styled.OptionSwitch>
    </Fragment>
  );
});

export default ButtonLabel;
