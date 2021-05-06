import React, { ReactElement } from 'react';
import Tooltip, { TooltipProps } from './base';
import * as Styled from './styled';

const InfoTooltip = (props: TooltipProps): ReactElement<TooltipProps> => {
  return (
    <Tooltip
      noDelay
      marginY
      cursorType="help"
      {...props}
    >
      <Styled.InfoIcon />
    </Tooltip>
  );
};

export default InfoTooltip;
