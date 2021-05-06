import Tooltip from '@components/tooltip';
import React, { FunctionComponent, useState } from 'react';
import * as Styled from '../styled';
import * as utils from '../utils';
import StatusTooltip from './tooltip';

interface StatusProps {
  status?: App.Github.StatusContext;
  isFake?: boolean;
}

const Status: FunctionComponent<StatusProps> = (props) => {
  const { status, isFake } = props;
  const BuildIcon = utils.buildIcon(status);
  const [isLoading, setIsLoading] = useState(false);

  const tooltipText = isFake || !status ? '' : <StatusTooltip status={status} />;

  const navigate = () => {
    if (!isLoading && status) {
      setIsLoading(true);
      window.location.href = status.targetUrl;
    }
  };

  return (
    <Tooltip
      noDelay
      isDisabled={isFake}
      pre
      placement="left"
      text={tooltipText}
    >
      <Styled.IconContainer
        isLink={!!status && !!status.targetUrl}
        onClick={navigate}
        isFake={isFake}
        appColor={BuildIcon.color}
      >
        <BuildIcon.icon />
      </Styled.IconContainer>
    </Tooltip>
  );
};

export default Status;
