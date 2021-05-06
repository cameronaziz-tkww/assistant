import Button from '@components/button';
import Input from '@components/input';
import { honeybadger } from '@hooks';
import React, { Fragment, FunctionComponent, useState } from 'react';

const Add: FunctionComponent = () => {
  const [project, setProject] = useState<string>();
  const { updateProjects } = honeybadger.useProjects();

  const handleAdd = () => {
    if (project) {
      updateProjects(project, true);
    }
  };

  const handleInputChange = (projectId: string) => {
    setProject(projectId);
  };

  return (
    <Fragment>
      <Input
        inline
        onReactChange={handleInputChange}
        inlineLabel
        label="Project ID"
        onlyNumbers
        maxSize={6}
      />
      <Button
        absolute={{
          top: 4,
          right: 4,
        }}
        onClick={handleAdd}
        size="sm"
      >
        Add
      </Button>
    </Fragment>
  );
};

export default Add;
