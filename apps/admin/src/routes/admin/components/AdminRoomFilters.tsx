import { Button } from '@vibes/ui';
import { type ChangeEvent, type SubmitEvent, useEffect, useState } from 'react';
import type { AdminRoomSearch } from '../rooms/loader';

interface AdminRoomFiltersProps {
  disabled: boolean;
  onSearch: (query: string) => void;
  onSort: (
    sortBy: AdminRoomSearch['sortBy'],
    order: AdminRoomSearch['order'],
  ) => void;
  search: AdminRoomSearch;
}

export function AdminRoomFilters({
  disabled,
  onSearch,
  onSort,
  search,
}: AdminRoomFiltersProps) {
  const [query, setQuery] = useState(search.q);

  useEffect(() => {
    setQuery(search.q);
  }, [search.q]);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = (event: SubmitEvent) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const handleSort = (event: ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, order] = event.target.value.split(':');
    if (
      (sortBy !== 'listeners' && sortBy !== 'songs') ||
      (order !== 'asc' && order !== 'desc')
    ) {
      return;
    }

    onSort(sortBy, order);
  };

  return (
    <form
      className="glass flex flex-col gap-3 rounded-2xl border-2 border-ink/10 p-4 sm:flex-row dark:border-gray-700"
      onSubmit={handleSearch}
    >
      <input
        className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base text-ink outline-hidden transition-colors placeholder:text-ink/40 focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        disabled={disabled}
        maxLength={roomQueryMaximumLength}
        onChange={handleQueryChange}
        placeholder="Search rooms by name"
        type="search"
        value={query}
      />
      <select
        aria-label="Sort rooms"
        className="rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base text-ink outline-hidden transition-colors focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        disabled={disabled}
        onChange={handleSort}
        value={`${search.sortBy}:${search.order}`}
      >
        {roomSortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button disabled={disabled} type="submit" variant="tertiary">
        Search
      </Button>
    </form>
  );
}

const roomSortOptions = [
  { label: 'Most listeners', value: 'listeners:desc' },
  { label: 'Fewest listeners', value: 'listeners:asc' },
  { label: 'Most songs', value: 'songs:desc' },
  { label: 'Fewest songs', value: 'songs:asc' },
];

const roomQueryMaximumLength = 100;
