import { useForceUpdate } from '@hooks';
import { uuid } from '@utils';
import React, { ChangeEvent, Fragment, FunctionComponent, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

export const Input: FunctionComponent<App.Input.InputProps> = (props) => {
  const {
    afterNode,
    containerPosition,
    defaultValue,
    focusOnMount,
    inlineLabel,
    inline,
    invalidText,
    isDisabled,
    handleLoseFocus,
    label,
    maxSize,
    onChange,
    onlyNumbers,
    onReactChange,
    ifDisabledColorSteady,
    forceRerender,
    value,
    ...rest
  } = props;
  const [hasFocused, setHasFocused] = useState(!focusOnMount);
  const [inputWidth, setInputWidth] = useState(100);
  const [afterNodeWidth, setAfterNodeWidth] = useState(0);
  const [localValue, setLocalValue] = useState(defaultValue || value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const afterNodeRef = useRef<HTMLSpanElement>(null);
  const uuidRef = useRef(uuid());
  const force = useForceUpdate();

  useEffect(
    () => {
      if (forceRerender) {
        force.update();
      }
    },
    [],
  );

  useEffect(
    () => {
      if (inputRef.current) {
        const { clientWidth } = inputRef.current;
        setInputWidth(clientWidth);

        if (!hasFocused && focusOnMount) {
          setHasFocused(true);
          inputRef.current.focus();
        }
      }
    },
    [inputRef, force.updateCount],
  );

  useEffect(
    () => {
      if (value || value === '') {
        setLocalValue(value);
      }
    },
    [value],
  );

  useEffect(
    () => {
      if (afterNodeRef.current) {
        const { clientWidth } = afterNodeRef.current;
        setAfterNodeWidth(clientWidth);
      }
    },
    [afterNodeRef],
  );

  useEffect(
    () => {
      if (inputRef.current) {
        inputRef.current.addEventListener('blur', onBlur);
      }

      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('blur', onBlur);
        }
      };
    },
    [inputRef, value],
  );

  useEffect(
    () => {
      if (inputRef.current) {
        inputRef.current.addEventListener('focus', onFocus);
      }

      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', onFocus);
        }
      };
    },
    [inputRef],
  );

  const onFocus = () => {
    if (isDisabled && inputRef.current) {
      inputRef.current.blur();
    }
  };

  const onBlur = () => {
    if (handleLoseFocus) {
      handleLoseFocus();
    }
  };

  const validate = (value: string): boolean => {
    if (maxSize && value.length > maxSize) {
      return false;
    }

    if (onlyNumbers) {
      const isNumber = Number(value);
      return !!isNumber || value.length === 0;
    }

    return true;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isValid = validate(event.target.value);

    if (!isValid) {
      return;
    }

    if (onChange) {
      onChange(event);
    }

    if (onReactChange) {
      onReactChange(event.target.value);
    }

    if (typeof value === 'undefined') {
      setLocalValue(event.target.value);
    }
  };

  return (
    <Fragment>
      {label &&
        <Styled.Label inlineLabel={inlineLabel} htmlFor={uuidRef.current}>
          {label}
        </Styled.Label>
      }
      <Styled.Container inline={inline} containerPosition={containerPosition}>
        <Styled.InputContainer>
          <Styled.Input
            afterNodeWidth={afterNodeWidth}
            size={maxSize ? maxSize + 1 : undefined}
            maxSize={maxSize}
            ref={inputRef}
            ifDisabledColorSteady={ifDisabledColorSteady}
            disabled={isDisabled}
            isDisabled={isDisabled}
            id={uuidRef.current}
            value={localValue}
            onChange={handleChange}
            hasLabel={!!label && label.length > 0}
            {...rest}
          />
          <Styled.InvalidText
            noMargin={props.noMargin}
          >
            {invalidText}
          </Styled.InvalidText>
        </Styled.InputContainer>
        {afterNode &&
          <Styled.AfterNode
            ref={afterNodeRef}
            hasMaxSize={typeof maxSize !== 'undefined'}
            afterNodeWidth={afterNodeWidth}
            inputWidth={inputWidth}
          >
            {afterNode}
          </Styled.AfterNode>
        }
      </Styled.Container>
    </Fragment>
  );
};

export default Input;
