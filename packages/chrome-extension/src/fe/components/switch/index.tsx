import React, { ChangeEvent, Fragment, ReactElement, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface SwitchProps<T extends App.ShouldDefineType> {
  value?: T;
  halfSize?: boolean;
  onChange?(value: T): void;
  options: App.UI.SwitchOptions<T>;
  isDisabled?: boolean;
  isBackgroundReverse?: boolean;
}

function Switch<T extends App.ShouldDefineType>(props: SwitchProps<T>): ReactElement<SwitchProps<T>> {
  const { options, isDisabled, isBackgroundReverse, halfSize, onChange, value } = props;
  const [leftOption, rightOption] = options;
  const inputRef = useRef<HTMLInputElement>(null);
  const rightOptionRef = useRef<HTMLDivElement>(null);
  const leftOptionRef = useRef<HTMLDivElement>(null);
  const [isChecked, setIsChecked] = useState(rightOption.value === value);
  const [isFocused, setIsFocused] = useState(false);
  const [leftOptionWidth, setLeftOptionWidth] = useState(18);
  const [rightOptionWidth, setRightOptionWidth] = useState(18);

  useEffect(
    () => {
      if (inputRef.current) {
        inputRef.current.addEventListener('focus', focusListener);
        inputRef.current.addEventListener('blur', blurListener);
      }

      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', focusListener);
          inputRef.current.removeEventListener('blur', blurListener);
        }
      };
    },
    [inputRef],
  );

  useEffect(
    () => {
      if (!rightOption.isIcon && rightOptionRef.current) {
        setRightOptionWidth(rightOptionRef.current.offsetWidth);
      }
    },
    [rightOptionRef, rightOption],
  );

  useEffect(
    () => {
      if (!leftOption.isIcon && leftOptionRef.current) {
        setLeftOptionWidth(leftOptionRef.current.offsetWidth);
      }
    },
    [leftOptionRef, leftOption],
  );

  const focusListener = () => {
    setIsFocused(true);
  };

  const blurListener = () => {
    setIsFocused(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      return;
    }

    const { checked } = event.target;
    setIsChecked(checked);
    if (onChange) {
      const value = checked ? rightOption.value : leftOption.value;
      onChange(value);
    }
  };

  return (
    <Styled.Container halfSize={halfSize}>
      <Styled.Slider
        isDisabled={isDisabled}
        isBackgroundReverse={isBackgroundReverse}
        isChecked={isChecked}
        isFocused={isFocused}
        rightOptionWidth={rightOptionWidth}
        leftOptionWidth={leftOptionWidth}
      />
      <Styled.Options isDisabled={isDisabled}>
        <Styled.LeftOption isChecked={isChecked} isDisabled={isDisabled} ref={leftOptionRef}>
          {leftOption.isIcon ?
            <Styled.Image src={leftOption.label} />
            :
            <Fragment>
              {leftOption.label || ''}
            </Fragment>
          }
        </Styled.LeftOption>
        <Styled.RightOption isChecked={isChecked} isDisabled={isDisabled} ref={rightOptionRef}>
          {rightOption.label || ''}
        </Styled.RightOption>
      </Styled.Options>
      <Styled.Input
        type="checkbox"
        ref={inputRef}
        onChange={handleChange}
      />
    </Styled.Container>

  );
}

export default Switch;
