import React, { Fragment, FunctionComponent } from 'react';
import * as Styled from './styled';

interface RotatorProps {
  rotated?: boolean;
}

const Rotator: FunctionComponent<RotatorProps> = (props) => {
  const { children, rotated } = props;

  if (!rotated) {
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }

  return (
    <Styled.RotateElementOuter>
      <Styled.RotateElement>
        {children}
      </Styled.RotateElement>
    </Styled.RotateElementOuter >
  );
};

export default Rotator;
