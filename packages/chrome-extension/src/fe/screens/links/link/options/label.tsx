import { isStandardConfig } from '@utils/guards';
import React, { FunctionComponent } from 'react';
import inputs from '../../inputs';

interface LabelProps {
  update<T extends keyof App.Links.Link>(key: T, value: App.Links.Link[T]): void;
  link: App.Links.Link;
  type: App.Links.LinkType;
}

const Label: FunctionComponent<LabelProps> = (props) => {
  const { link, update, type } = props;
  const { label } = link;

  const onChange = (value: string) => {
    update('label', value);
  };

  const isAllowed = isStandardConfig(type, link) ? link.buttonChoice === 'letter' : true;
  const isInputDisabled = link.enabled ? !isAllowed : true;

  return (
    <inputs.Generic
      isDisabled={isInputDisabled}
      defaultValue={label}
      label="Label"
      generic={inputs.label}
      handleChange={onChange}
      onlyValidChange
      tooltipParts={isInputDisabled && link.enabled ? [{ isPath: false, text: 'Only available when Button is set to Letters' }] : []}
    />
  );
};

export default Label;
