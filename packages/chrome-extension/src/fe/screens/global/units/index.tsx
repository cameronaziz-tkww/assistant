import { global } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';
import Unit from './unit';

const Units: FunctionComponent = () => {
  const { allUnits } = global.useUnits();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Show Units
      </Styled.SectionTitle>
      <Styled.SectionContent>
        {allUnits.length > 0 && allUnits.map((unit) =>
          <Unit
            key={unit}
            unit={unit}
          />,
        )}
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Units;
