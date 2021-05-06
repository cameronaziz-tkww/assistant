import { Button } from '@components/button';
import Card from '@components/card';
import { links } from '@hooks';
import React, { FunctionComponent, useRef } from 'react';
import inputs, { GenericRef } from '../inputs';
import * as Styled from './styled';

const Create: FunctionComponent = () => {
  const urlRef = useRef<GenericRef>(null);
  const labelRef = useRef<GenericRef>(null);
  const createLink = links.useCreateLink();

  const handleCreate = () => {
    const url = urlRef.current?.checkValidValue();
    const label = labelRef.current?.checkValidValue();

    if (label && url) {
      createLink({
        url,
        label,
      });
    }
  };

  return (
    <Card
      contentDisplay="grid"
      contentColumns={2}
      contentSize="md"
      title={{
        text: 'New Link',
      }}
      endTitle={
        <Button
          onClick={handleCreate}
          size="sm"
        >
          Create
        </Button>
      }
    >
      <Styled.CreateContainer>
        <inputs.Generic
          ref={labelRef}
          label="Label"
          onlyValidChange
          generic={inputs.label}
        />
        <inputs.Generic
          ref={urlRef}
          label="URL"
          onlyValidChange
          generic={inputs.url}
        />
      </Styled.CreateContainer>
    </Card>
  );
};

export default Create;
