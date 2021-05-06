import Checkbox from '@components/checkbox';
import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';

interface SelectionProps {
  handleClick(value: App.Jira.FilterableKeys, nextState: boolean): void;
  value: App.Jira.FilterableKeys;
  label: string;
}

const Selection: FunctionComponent<SelectionProps> = (props) => {
  const { handleClick, value, label } = props;
  const { filters } = jira.useSettings(['filters']);

  const onClick = (nextState: boolean) => {
    handleClick(value, nextState);
  };

  return (
    <Checkbox
      handleClick={onClick}
      label={label}
      isChecked={filters.includes(value)}
    />
  );
};

export default Selection;
