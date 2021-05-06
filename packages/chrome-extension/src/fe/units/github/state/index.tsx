import React, { FunctionComponent } from 'react';
import * as Styled from './styled';
import Checks from './checks';
import Reviews from './reviews';

interface StatusProps {
  pullRequest: App.Github.PullRequest;
}

const Statuses: FunctionComponent<StatusProps> = (props) => {
  const { pullRequest } = props;
  // const mergeable = ApprovedIcon.color === 'green' && BuildIcon.color === 'green';

  // if (mergeable) {
  //   const tooltip = `${ApprovedIcon.text}\n${statusDescription}`
  //   return (
  //     <Tooltip
  //       noDelay
  //       pre
  //       text={tooltip}
  //     >
  //       <Styled.ReadyContainer>
  //         <Styled.IconContainer appColor="black">
  //           <GrValidate />
  //         </Styled.IconContainer>
  //         <Styled.Ready>
  //           Ready
  //         </Styled.Ready>
  //       </Styled.ReadyContainer>
  //     </Tooltip>
  //   )
  // }

  return (
    <Styled.Container>
      <Checks pullRequest={pullRequest} />
      <Reviews pullRequest={pullRequest} />
    </Styled.Container>
  );
};

export default Statuses;
