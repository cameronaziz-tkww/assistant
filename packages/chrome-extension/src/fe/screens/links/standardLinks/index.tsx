import { links } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';
import Link from '../link';

const StandardLinks: FunctionComponent = () => {
  const { standard } = links.useLinks();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Standard Links
      </Styled.SectionTitle>
      <Styled.SectionContent displayType="grid">
        {standard.map((config) =>
          <Link
            key={config.id}
            link={config}
            type="standard"
          />,
        )}
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default StandardLinks;
