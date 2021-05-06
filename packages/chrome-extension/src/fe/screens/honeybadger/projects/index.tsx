import { honeybadger } from '@hooks';
import React, { Fragment, FunctionComponent } from 'react';
import * as Styled from '../../styled';
import Add from './add';
import Watched from './watched';

const Projects: FunctionComponent = () => {
  const { watchedProjects } = honeybadger.useProjects();

  return (
    <Styled.Section>
      <Styled.SectionTitle>
        Projects
      </Styled.SectionTitle>
      <Styled.SectionContent>
        <Styled.SectionSubTitle>
          Add
        </Styled.SectionSubTitle>
        <Styled.SectionSubSection>
          <Add />
        </Styled.SectionSubSection>
        {watchedProjects.length > 0 &&
          <Fragment>
            <Styled.SectionSubTitle>
              Watched
            </Styled.SectionSubTitle>
            <Styled.SectionSubSection>
              {watchedProjects.map((project) =>
                <Watched
                  key={project.id}
                  projectId={project.id}
                />,
              )}
            </Styled.SectionSubSection>
          </Fragment>
        }
      </Styled.SectionContent>
    </Styled.Section>
  );
};

export default Projects;
