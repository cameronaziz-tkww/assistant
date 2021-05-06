import { DataContainer } from '@components/containers';
import Tree from '@components/tree';
import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../../styled';

const Config: FunctionComponent = () => {
  const { projects } = jira.useProjects();

  const onSelect = () => {
    // Do Nothing
  };

  const treeItems: App.UI.TreeItem[] = projects.all.map((project): App.UI.TreeItem => ({
    label: project.name,

    subtext: {
      label: project.key,
      color: {
        color: 'green',
        background: 'grey-dark',
      },
    },
    id: project.id,
  }));

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Settings
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <DataContainer>
          <Tree
            onSelect={onSelect}
            items={treeItems}
          />
        </DataContainer>
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Config;
