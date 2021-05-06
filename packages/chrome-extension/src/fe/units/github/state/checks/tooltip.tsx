import React, { FunctionComponent } from 'react';
import * as Styled from '../styled';

interface TooltipProps {
  status: App.Github.StatusContext;
}

const Tooltip: FunctionComponent<TooltipProps> = (props) => {
  const { status } = props;

  return (
    <div>
      <Styled.TooltipHeader>
        {status.context}
      </Styled.TooltipHeader>
      {status.description}
    </div>
  );
};

export default Tooltip;
