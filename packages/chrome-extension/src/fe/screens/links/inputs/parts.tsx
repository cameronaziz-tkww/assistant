import React, { FunctionComponent, Fragment } from 'react';
import * as Styled from './styled';

interface TooltipProps {
  parts: App.Links.TooltipParts[]
}

const Tooltip: FunctionComponent<TooltipProps> = (props) => {
  const { parts } = props;

  return (
    <Fragment>
      {parts.map((part) =>
        part.isPath ?
          <Styled.TooltipPart key={part.text}>
            {part.text}
          </Styled.TooltipPart>
        :
          <Styled.TooltipNotPart key={part.text}>
            {part.text}
          </Styled.TooltipNotPart>,
      )}
    </Fragment>
  );
};

export default Tooltip;
