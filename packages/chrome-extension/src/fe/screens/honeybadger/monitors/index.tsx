import { honeybadger } from '@hooks';
import React, { Fragment, FunctionComponent } from 'react';
import * as Styled from '../../styled';
import Create from './create';
import Delete from './delete';

const Monitors: FunctionComponent = () => {
  const { monitors } = honeybadger.useMonitors();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Monitors
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <Styled.SectionSubTitle>
          Create
        </Styled.SectionSubTitle>
        <Styled.SectionSubSection>
          <Create />
        </Styled.SectionSubSection>
        {monitors.length > 0 &&
          <Fragment>
            <Styled.SectionSubTitle>
              Current
            </Styled.SectionSubTitle>
            <Styled.SectionSubSection>
              {monitors.map((monitor, index) =>
                <Delete
                  key={`${monitor.timeAgo} - ${monitor.noticeLimit} - ${index}`}
                  monitor={monitor}
                />,
              )}
            </Styled.SectionSubSection>
          </Fragment>
        }
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Monitors;
