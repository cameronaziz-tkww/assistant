import React, { Fragment, FunctionComponent } from 'react';
import Pill from '../pill';

interface SubtextProps {
  subtext: App.UI.TreeSubtext | App.UI.TreeSubtext[]
}

const Subtext: FunctionComponent<SubtextProps> = (props) => {
  const { subtext } = props;

  if (Array.isArray(subtext)) {
    return (
      <Fragment>
        {subtext.map((text) =>
          <Pill
            nowrap
            key={text.label}
            capitalize
            size="xs"
            foreground={text.color?.color || 'white'}
            background={text.color?.background || 'grey-dark'}
          >
            {text.label}
          </Pill>,
        )}
      </Fragment>
    );
  }

  return (
    <Pill
      nowrap
      capitalize
      size="xs"
      foreground={subtext.color?.color || 'white'}
      background={subtext.color?.background || 'grey-dark'}
    >
      {subtext.label}
    </Pill>
  );
};

export default Subtext;
