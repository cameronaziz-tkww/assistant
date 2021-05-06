import { capitalize } from '@utils';
import React, { FunctionComponent } from 'react';
import inputs from '../../inputs';

interface PathProps {
  update<T extends keyof App.Links.StandardConfig>(key: T, value: App.Links.StandardConfig[T]): void;
  link: App.Links.StandardConfig;
  path: App.Links.PathsNeeded;
  index: number;
}

const Path: FunctionComponent<PathProps> = (props) => {
  const { link, update, index, path } = props;

  const onChange = (value: string) => {
    const currentPath = link.path || [];
    const nextPath = [...currentPath];
    nextPath[index] = value;
    update('path', nextPath);
  };

  const defaultValue = link.path && link.path[index] ? link.path[index] : undefined;

  return (
    <inputs.Generic
      isDisabled={!link.enabled}
      defaultValue={defaultValue}
      label={capitalize(path.name)}
      generic={inputs.path}
      handleChange={onChange}
      onlyValidChange
      tooltipParts={path.tooltipParts}
    />
  );
};

export default Path;
