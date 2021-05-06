import { ErrorTooltip } from '@components/tooltip';
import { links } from '@hooks';
import React, { FunctionComponent } from 'react';

interface TitleProps {
  link: App.Links.Link;
  type: App.Links.LinkType;
}

const Title: FunctionComponent<TitleProps> = (props) => {
  const { type, link } = props;
  const { active, standard } = links.useLinks();
  const label = standard.find((item) => item.id === link.id)?.title || link.label;

  const isIncomplete = active.findIndex((l) => l.id === link.id) < 0;
  const inCompleteText = type === 'custom' ?
    'The URL provided is invalid' :
    'All URL fields must be populated.';

  return (
    <div>
      {label}
      {isIncomplete && link.enabled &&
        <ErrorTooltip inline text={inCompleteText} />
      }
    </div>
  );
};

export default Title;
