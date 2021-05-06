import Pill from '@components/pill';
import { honeybadger } from '@hooks';
import React, { FunctionComponent } from 'react';

interface WatchedProps {
  projectId: string;
}

const Watched: FunctionComponent<WatchedProps> = (props) => {
  const { projectId } = props;
  const { updateProjects } = honeybadger.useProjects();

  const handleDelete = () => {
    updateProjects(projectId, false);
  };

  return (
    <Pill
      minContent
      onClose={handleDelete}
      themeColor="secondary"
      label={projectId}
    />
  );
};

export default Watched;
