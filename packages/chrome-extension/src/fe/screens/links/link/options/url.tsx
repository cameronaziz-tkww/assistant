import React, { FunctionComponent } from 'react';
import inputs from '../../inputs';

interface URLProps {
  update<T extends keyof App.Links.CustomConfig>(key: T, value: App.Links.CustomConfig[T]): void;
  link: App.Links.CustomConfig;
}

const URL: FunctionComponent<URLProps> = (props) => {
  const { update, link } = props;

  const onChange = (value: string) => {
    update('url', value);
  };

  return (
    <inputs.Generic
      isDisabled={!link.enabled}
      defaultValue={link.url}
      label="URL"
      generic={inputs.url}
      handleLoseFocus={onChange}
      onlyValidChange
    />
  );
};

export default URL;
