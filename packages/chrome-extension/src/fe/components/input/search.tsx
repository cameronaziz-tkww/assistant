import React, { FunctionComponent, useState } from 'react';
import Input from './base';
import * as Styled from './styled';

interface SearchComponentProps extends App.Input.InputProps {
  clearSearch?(): void;
}

const Search: FunctionComponent<SearchComponentProps> = (props) => {
  const { clearSearch, label, onReactChange, ...rest } = props;
  const [hasValue, setHasValue] = useState(typeof rest.defaultValue === 'undefined' ? false : `${rest.defaultValue}`.length > 0);

  const internalReactChange = (value: string) => {
    const nextHasValue = value.length > 0;
    if (nextHasValue !== hasValue) {
      setHasValue(nextHasValue);
    }

    if (onReactChange) {
      onReactChange(value);
    }
  };

  return (
    <Styled.SearchContainer>
      <Input
        label={label || 'Search'}
        onReactChange={internalReactChange}
        {...rest}
      />
      {clearSearch && hasValue && <Styled.Clear onClick={clearSearch} />}
    </Styled.SearchContainer>
  );
};

export default Search;
