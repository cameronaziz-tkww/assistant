import Unit from '@components/unit';
import { honeybadger } from '@hooks';
import React, { FunctionComponent } from 'react';

const HighlightsUI: FunctionComponent = () => {
  const faults = honeybadger.useFaults();

  return (
    <Unit.Container rightMargin column="first">
      <Unit.Title
        align="left"
        text="Highlights"
      />

    </Unit.Container>
  );
};

export default HighlightsUI;
