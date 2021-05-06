import Card from '@components/card';
import React, { FunctionComponent } from 'react';
import Delete from './delete';
import Options from './options';
import Title from './title';
import Toggle from './toggle';

interface LinkProps {
  link: App.Links.Link;
  type: App.Links.LinkType;
}

const Link: FunctionComponent<LinkProps> = (props) => {
  const { link, type } = props;

  return (
    <Card
      contentSize="md"
      title={{
        text: <Title link={link} type={type} />,
      }}
      endTitle={<Toggle link={link} isBackgroundReverse={!link.enabled} />}
      centerTitle={<Delete link={link} type={type} />}
      isDisabled={!link.enabled}
    >
      <Options
        type={type}
        link={link}
      />
    </Card>
  );
};

export default Link;
