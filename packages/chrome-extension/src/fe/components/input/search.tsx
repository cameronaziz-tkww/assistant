import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import Input from './base';
import * as Styled from './styled';

interface SearchComponentProps {
  handleChange(event: ChangeEvent<HTMLInputElement>): void;
  clearSearch(): void;
  label?: string;
  focusOnMount?: boolean;
}

const Search: FunctionComponent<SearchComponentProps> = (props) => {
  const { handleChange, clearSearch, focusOnMount, label } = props;

  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleChange(event);
      // updateHasValue(event.target.value);
    }, []);

  return (
    <Styled.SearchContainer>
      <Styled.SearchLabel>
        {label || 'Search'}
      </Styled.SearchLabel>
      <Input focusOnMount={focusOnMount} onChange={change} />
      {<Styled.Clear onClick={clearSearch} />}
    </Styled.SearchContainer>
  );
};

export default Search;
