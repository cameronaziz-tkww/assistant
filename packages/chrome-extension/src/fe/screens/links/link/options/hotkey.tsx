import { links } from '@hooks';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import inputs, { GenericRef } from '../../inputs';

interface HotkeyProps {
  update<T extends keyof App.Links.Link>(key: T, value: App.Links.Link[T]): void;
  link: App.Links.Link;
}

const Hotkey: FunctionComponent<HotkeyProps> = (props) => {
  const inputRef = useRef<GenericRef>(null);
  const { update, link } = props;
  const { all } = links.useLinks();
  const { hotkey, enabled } = link;
  const { hotkey: input } = inputs;

  useEffect(
    () => {
      if (!enabled && hotkey && inputRef.current) {
        inputRef.current.clearValue();
        update('hotkey', undefined);
      }
    },
    [link, inputRef],
  );
  const onChange = (value: string) => {
    update('hotkey', value);
  };

  return (
    <inputs.Generic
      isDisabled={!link.enabled}
      ref={inputRef}
      defaultValue={hotkey}
      label="Hotkey"
      generic={{
        ...input,
        evaluateChange: input.evaluateChange(all, link),
      }}
      handleChange={onChange}
      onlyValidChange
    />
  );
};

export default Hotkey;
