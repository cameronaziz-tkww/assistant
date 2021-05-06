import React, { FunctionComponent } from 'react';
import * as Styled from './state/styled';

interface ApprovalTooltipProps {
  author: API.DataStructure.Author
}

const ApprovalTooltip: FunctionComponent<ApprovalTooltipProps> = (props) => {
  const { author } = props;

  return (
    <Styled.ApprovalTooltip>
      <Styled.Avatar src={author.avatarUrl} />
      {author.login}
    </Styled.ApprovalTooltip>
  );
};

export default ApprovalTooltip;
