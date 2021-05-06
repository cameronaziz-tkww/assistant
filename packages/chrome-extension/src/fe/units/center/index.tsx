import Unit from '@components/unit';
import { links } from '@context';
import Links from '@units/links';
import React, { FunctionComponent } from 'react';
import Settings from './settings';
import * as Styled from './styled';

interface CenterProps {
  showLinks: boolean;
}

const Center: FunctionComponent<CenterProps> = (props) => {
  const { showLinks } = props;

  return (
    <Unit.Container column="second">
      <Styled.Container>
        <links.Provider>
          <Links isVisible={showLinks} />
        </links.Provider>
        <Settings />
      </Styled.Container>
    </Unit.Container>
  );
};

export default Center;
