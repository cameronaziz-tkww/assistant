import Input from '@components/input';
import { InfoTooltip } from '@components/tooltip';
import { useForceUpdate } from '@hooks';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Parts from './parts';

interface GenericProps {
  handleChange?(value: string): void;
  handleLoseFocus?(value: string): void;
  defaultValue?: string;
  onlyValidChange?: boolean;
  label: string;
  tooltipParts?: App.Links.TooltipParts[]
  isDisabled?: boolean;
  generic: App.Input.Generic;
}

export interface GenericRef {
  clearValue(): void;
  checkValidValue(): false | string;
}

const Generic = forwardRef<GenericRef, GenericProps>((props, ref) => {
  const {
    defaultValue,
    generic,
    handleChange,
    handleLoseFocus,
    isDisabled,
    label,
    tooltipParts,
    onlyValidChange,
  } = props;
  const {
    evaluateChange,
    evaluateValue,
    maxSize,
    modifyChange,
  } = generic || {};

  const tooltip = tooltipParts || [];
  const force = useForceUpdate();

  useEffect(
    () => {
      force.update();
    },
    [],
  );

  const [value, setValue] = useState(defaultValue || '');
  const [validInput, setValidInput] = useState<string | undefined>();

  useImperativeHandle(ref, () => ({
    clearValue: () => {
      setValue('');
    },
    checkValidValue: () => {
      if (evaluateValue) {
        const result = evaluateValue(value);
        setValidInput(result);
        if (!result) {
          return value;
        }
        return false;
      }
      return value;
    },
  }));

  const onReactChange = (value: string) => {
    run(value, handleChange);
  };

  const run = (nextValue: string, cb?: (nextValue: string) => void) => {
    const cleanValue = modifyChange ? modifyChange(nextValue) : nextValue;
    if (evaluateChange) {
      const result = evaluateChange(cleanValue);
      if (typeof result !== 'undefined') {
        setValidInput(result);
        if (!onlyValidChange) {
          setValue(cleanValue);
          if (cb) {
            cb(cleanValue);
          }
          return;
        }
        return;
      }
    }

    setValidInput(undefined);
    setValue(cleanValue);

    if (cb) {
      cb(cleanValue);
    }

    return false;
  };

  const onLoseFocus = () => {
    run(value, handleLoseFocus);
  };

  return (
    <Input
      noMargin
      maxSize={maxSize}
      isDisabled={isDisabled}
      ifDisabledColorSteady
      value={value}
      isInvalid={!!validInput}
      handleLoseFocus={onLoseFocus}
      onReactChange={onReactChange}
      containerPosition="left"
      label={label}
      forceRerender
      invalidText={validInput}
      afterNode={tooltip.length > 0 && <InfoTooltip text={<Parts parts={tooltip} />} />}
    />
  );
});

export default Generic;
