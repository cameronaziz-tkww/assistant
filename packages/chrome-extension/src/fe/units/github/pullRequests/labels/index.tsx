import React, { FunctionComponent } from 'react';
import * as Styled from './styled';
import Label from './label';
import NoLabels from './noLabels';

interface DetailsProps {
  pullRequest: App.Github.PullRequest;
}

const Labels: FunctionComponent<DetailsProps> = (props) => {
  const { labels } = props.pullRequest;
  const labelCount = labels.length;

  return (
    <Styled.Container>
      {labelCount > 0 ?
        labels.map((label) =>
          <Label key={label.name} label={label} />,
        )
      :
        <NoLabels />
      }
    </Styled.Container>
  );
};

export default Labels;
