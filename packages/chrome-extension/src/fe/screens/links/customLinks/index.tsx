import { links } from '@hooks';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';
import Link from '../link';
import Create from './create';

const CustomLinks: FunctionComponent = () => {
  const { custom } = links.useLinks();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Custom Links
      </Styled.SectionTitle>
      <Styled.SectionContent displayType="grid">
        <Create />
      </Styled.SectionContent>
      <Styled.SectionContent displayType="grid">
        {custom.map((customLink) =>
          <Link
            key={customLink.url}
            type="custom"
            link={customLink}
          />,
        )}
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default CustomLinks;
