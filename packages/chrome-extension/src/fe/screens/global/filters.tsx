import Checkbox from '@components/checkbox';
import { global } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../styled';

const Filters: FunctionComponent = () => {
  const { setRememberSelections, rememberSelections } = global.useRememberSelections();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Filters
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <Checkbox
          isChecked={rememberSelections}
          handleClick={setRememberSelections}
          label="Remember Filter Selections"
        />
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Filters;
