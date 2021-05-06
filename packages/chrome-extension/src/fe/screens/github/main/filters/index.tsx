import Checkbox from '@components/checkbox';
import { DataContainer } from '@components/containers';
import { github } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../../styled';

interface Selections {
  key: App.Github.FilterableKeys;
  label: string;
}

const available: Selections[] = [
  {
    key: 'createdBy',
    label: 'Created By',
  },
  {
    key: 'labels',
    label: 'Labels',
  },
  {
    key: 'status',
    label: 'Status',
  },
];

const Filters: FunctionComponent = () => {
  const { settings: { filters } } = github.useSettings(['filters']);

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Filters
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <DataContainer>
          {available.map((selection) =>
            <Checkbox
              key={selection.key}
              label={selection.label}
              isChecked={filters.includes(selection.key)}
            />,
          )}
        </DataContainer>
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Filters;
