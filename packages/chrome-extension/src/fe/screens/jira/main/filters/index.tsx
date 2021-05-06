import { DataContainer } from '@components/containers';
import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../../styled';
import Selection from './selection';

interface Selections {
  value: App.Jira.FilterableKeys;
  label: string;
}

const available: Selections[] = [
  {
    value: 'assignee',
    label: 'Assignee',
  },
  {
    value: 'sprints',
    label: 'Sprint',
  },
  {
    value: 'status',
    label: 'Status',
  },
];

const Filters: FunctionComponent = () => {
  const update = jira.useUpdateSettings();
  const { filters } = jira.useSettings(['filters']);

  const onClick = (value: App.Jira.FilterableKeys, nextState: boolean): void => {
    if (nextState) {
      if (!filters.includes(value)) {
        update('filters', [...filters, value]);
      }
      return;
    }
    update('filters', filters.filter((filter) => filter !== value));
  };

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Filters
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <DataContainer>
          {available.map((selection) =>
            <Selection
              key={selection.value}
              handleClick={onClick}
              value={selection.value}
              label={selection.label}
            />,
          )}
        </DataContainer>
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Filters;
