import { DataContainer } from '@components/containers';
import { InfoTooltip } from '@components/tooltip';
import Tree from '@components/tree';
import { jira } from '@hooks';
import { chrome } from '@utils';
import React, { Fragment, FunctionComponent, useState } from 'react';
import * as Styled from '../../../styled';

const rightChildItems: App.UI.TreeItem[] = [
  {
    id: 'onlyActive',
    label: 'Only issues in active sprint',
  },
  {
    id: 'onlyAssigned',
    label: 'Only assigned issues',
  },
];

const Projects: FunctionComponent = () => {
  const {
    updateWatched,
    projects: {
      watchedProjects,
      watches,
      all,
    },
  } = jira.useProjects();
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);

  const onSelect = (path: string[], nextInclude: boolean) => {
    const [projectId, id] = path;
    const idIsStatus = rightChildItems.findIndex((item) => item.id === id) === -1;
    updateWatched({
      projectId,
      id,
      nextInclude,
      idIsStatus,
    });
  };

  const onClick = ([projectKey]: string[]) => {
    setLoadingKeys([...loadingKeys, projectKey]);
    chrome.runtime.send({ type: 'jira/STATUSES_FETCH', projectKey });
  };

  const buildChildren = (project: App.Jira.Project): App.UI.TreeItem[] => {
    const duplicates = new Map<string, number>();
    const projectWatches = watches[project.id];

    return project.statuses
      .map((status) => {
        const amount = duplicates.get(status.issueType) || 0;
        duplicates.set(status.issueType, amount + 1);
        return status;
      })
      .sort(
        (a, b) => {
          const aName = a.issueType.toUpperCase();
          const bName = b.issueType.toUpperCase();
          if (aName > bName) {
            return 1;
          }

          if (aName < bName) {
            return -1;
          }
          return 0;
        },
      )
      .map(
        (status): App.UI.TreeItem => {
          const count = duplicates.get(status.issueType);
          const subtext: App.UI.TreeSubtext | undefined = count && count > 1 ?
            {
              label: status.issueType,
              color: {
                color: 'black',
                background: 'green',
              },
            }
            : undefined;

          return {
            isSelected: projectWatches && projectWatches.statuses.includes(status.id) ? true : false,
            label: status.name,
            id: status.id,
            subtext,
          };
        },
      )
      .reduce(
        (acc, cur) => {
          if (cur.subtext) {
            const same = acc.find((item) => item.label === cur.label);
            if (same && same.subtext) {
              if (Array.isArray(same.subtext)) {
                if (Array.isArray(cur.subtext)) {
                  same.subtext.push(...cur.subtext);
                  return acc;
                }
                same.subtext.push(cur.subtext);
                return acc;
              }
              if (Array.isArray(cur.subtext)) {
                same.subtext = [same.subtext, ...cur.subtext];
                return acc;
              }
              same.subtext = [same.subtext, cur.subtext];
              return acc;
            }
          }
          acc.push(cur);
          return acc;
        },
        [] as App.UI.TreeItem[],
      );
  };

  const buildRightChildren = (project: App.Jira.Project): App.UI.TreeItem[] => rightChildItems.map((item) => ({
    ...item,
    isSelected: watches[project.id]?.filters[item.id],
  }));

  const treeItems = (projectKind: App.Jira.Project[]): App.UI.TreeItem[] => projectKind.map((project): App.UI.TreeItem => ({
    label: project.name,
    subtext: {
      label: project.key,
      color: {
        color: 'green',
        background: 'grey-dark',
      },
    },
    loading: {
      isLoading: loadingKeys.includes(project.key) && project.statuses.length === 0,
      mayHaveChildren: true,
    },
    childItemsTitle:
      <Fragment>
        <div>
          Statuses
        </div>
        <InfoTooltip
          text="Follow a project for all sprints for a given status"
        />
      </Fragment>,
    rightChildItemsTitle:
      <Fragment>
        <div>
          Filters
      </div>
        <InfoTooltip
          text="Add filters to only see certain issues"
        />
      </Fragment>,
    id: project.id,
    childItems: buildChildren(project),
    rightChildItems: project.statuses.length > 0 && watches[project.id]?.statuses.length > 0 ? buildRightChildren(project) : undefined,
  }));

  return (
    <Fragment>
      <Styled.Section>
        <Styled.SectionTitle>
          Watched Projects
        </Styled.SectionTitle>
        <Styled.SectionContent>
          <DataContainer>
            <Tree
              onClick={onClick}
              items={treeItems(watchedProjects)}
              onSelect={onSelect}
            />
          </DataContainer>
        </Styled.SectionContent>
      </Styled.Section>
      <Styled.Section>
        <Styled.SectionTitle>
          Other Projects
        </Styled.SectionTitle>
        <Styled.SectionContent>
          <DataContainer>
            <Tree
              onClick={onClick}
              items={treeItems(all)}
              onSelect={onSelect}
            />
          </DataContainer>
        </Styled.SectionContent>
      </Styled.Section>
    </Fragment>
  );
};

export default Projects;
