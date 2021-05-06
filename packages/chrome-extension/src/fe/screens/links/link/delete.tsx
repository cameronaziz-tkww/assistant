import Button from '@components/button';
import { links } from '@hooks';
import React, { FunctionComponent } from 'react';

interface DeleteProps {
  link: App.Links.Link;
  type: App.Links.LinkType;
}

const Delete: FunctionComponent<DeleteProps> = (props) => {
  const { link, type } = props;
  const deleteLink = links.useDeleteLink();

  const handleDelete = () => {
    if (deleteLink) {
      deleteLink(link.id);
    }
  };

  if (type === 'standard') {
    return null;
  }

  return (
    <Button
      onClick={handleDelete}
      size="xs"
    >
      Delete
    </Button>
  );
};

export default Delete;
