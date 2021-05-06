import React, { ReactElement } from 'react';
import Tooltip, { TooltipProps } from './base';
import * as Styled from './styled';

const ErrorTooltip = (props: TooltipProps): ReactElement<TooltipProps> => {
  return (
    <Tooltip
      noDelay
      marginY
      {...props}
    >
      <Styled.ErrorIcon />
    </Tooltip>
  );
};

export default ErrorTooltip;
