import React, { Fragment, FunctionComponent } from 'react';
import Checkbox from '../checkbox';
import * as Styled from './styled';

interface CaretProps {
  label: string;
  hasChildren: boolean;
  isActive: boolean;
  onSelect?(): void;
  isSelected?: boolean;
  mayHaveChildren?: boolean;
}

const Caret: FunctionComponent<CaretProps> = (props) => {
  const { hasChildren, mayHaveChildren, label, isActive, onSelect, isSelected } = props;

  if (!hasChildren && !mayHaveChildren) {
    if (onSelect) {
      return (
        <Checkbox
          handleClick={onSelect}
          isChecked={isSelected}
          label={label}
        />
      );
    }

    return (
      <Fragment>
        <Styled.CaretHidden />
        {label}
      </Fragment>
    );
  }

  if (isActive) {
    return (
      <Fragment>
        <Styled.CaretDown />
        {label}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Styled.CaretRight />
      {label}
    </Fragment>
  );
};

export default Caret;