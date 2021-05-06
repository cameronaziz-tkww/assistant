import { modal } from '@context';
import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface ContainerProps {
  column: App.UnitColumn
  leftMargin?: boolean;
  rightMargin?: boolean;
  rotated?: boolean;
  block?: boolean;
  hasData: boolean;
}

const Container: FunctionComponent<ContainerProps> = (props) => {
  const { children } = props;
  const state = modal.useTrackedState();

  return (
    <Styled.Container {...props}>
      {children}
      {/* {state.hiddenUnits.includes(unit) && <Styled.HiddenContainer />} */}
    </Styled.Container>
  );
};

export default Container;
