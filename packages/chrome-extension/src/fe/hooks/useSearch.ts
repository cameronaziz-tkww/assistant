import FuzzySearch from 'fuzzy-search';
import { ChangeEvent, useEffect, useState } from 'react';

type UseSearchValue<T> = [T[], SearchHandlers]
interface UseSearchConfig {
  ignoreCase?: boolean;
  searchValues?: string[];
}

interface SearchHandlers {
  handleChange(event: ChangeEvent<HTMLInputElement>): void;
  clearSearch(): void;
  searchTerm: string;
}

const useSearch = <T extends string | Record<string, unknown>>(values: T[], config?: UseSearchConfig): UseSearchValue<T> => {
  const [filteredValues, setFilteredValues] = useState<T[]>(values);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const caseSensitive = !config?.ignoreCase;
  const searchValue = config?.searchValues ? config.searchValues : undefined;

  useEffect(
    () => {
      setSearchTerm('');
      setFilteredValues(values);
    },
    [values],
  );

  useEffect(
    () => {
      search();
    },
    [searchTerm],
  );

  const search = () => {
    if (!searchTerm) {
      setFilteredValues(values);
      return;
    }

    const searcher = new FuzzySearch(
      values,
      searchValue,
      {
        caseSensitive,
        sort: true,
      },
    );
    const nextFilteredValues = searcher.search(searchTerm);

    setFilteredValues(nextFilteredValues);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  return [
    filteredValues,
    {
      clearSearch,
      handleChange,
      searchTerm,
    },
  ];
};

export default useSearch;