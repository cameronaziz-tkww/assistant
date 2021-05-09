import Checkbox from '@components/checkbox';
import { global } from '@hooks';
import React, { FunctionComponent } from 'react';

interface UnitProps {
  unit: App.VisibleUnit;
}

const Unit: FunctionComponent<UnitProps> = (props) => {
  const { unit } = props;
  const { visibleUnits, setVisibleUnit } = global.useUnits();

  const handleClick = (nextState: boolean) => {
    /* ~ LOG */ console.log('~ nextState', nextState, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
    setVisibleUnit(unit, nextState);
  };

  return (
    <Checkbox
      capitalize
      isChecked={visibleUnits.includes(unit)}
      handleClick={handleClick}
      label={unit}
    />
  );
};

export default Unit;
