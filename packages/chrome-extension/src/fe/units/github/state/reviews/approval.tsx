import Tooltip from '@components/tooltip';
import React, { FunctionComponent } from 'react';
import { BsCircleFill } from 'react-icons/bs';
import AuthorTooltip from '../../authorTooltip';
import * as Styled from '../styled';

interface ApprovalProps {
  approval: API.DataStructure.LatestOpinionatedReview
}

const Approval: FunctionComponent<ApprovalProps> = (props) => {
  const { approval } = props;

  return (
    <Tooltip
      noDelay
      pre
      placement="left"
      text={<AuthorTooltip author={approval.author} />}
    >
      <Styled.IconContainer appColor="green">
        <BsCircleFill />
      </Styled.IconContainer>
    </Tooltip>
  );
};

export default Approval;
