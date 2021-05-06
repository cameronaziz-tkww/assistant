import React, { FunctionComponent, useState, Fragment } from 'react';
import * as Styled from './styled';

interface EndFooterProps {
  endFooter: App.Card.EndFooter;
}

const EndFooter: FunctionComponent<EndFooterProps> = (props) => {
  const { endFooter } = props;
  const [endFooterExpanded, setEndFooterExpanded] = useState(false);

  const clickFooter = () => {
    if (endFooter?.expand) {
      setEndFooterExpanded(!endFooterExpanded);
    }
  };

  return (
    <Styled.EndFooter>
      {endFooterExpanded ?
        <Styled.EndFooterExpand
          onClick={clickFooter}
        >
          {endFooter.expand}
        </Styled.EndFooterExpand>
        :
        <Fragment>
          {endFooter.text}
        </Fragment>
      }
    </Styled.EndFooter>
  );
};

export default EndFooter;
