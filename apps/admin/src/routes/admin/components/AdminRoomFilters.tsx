import { Button } from '@vibes/ui/web';
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'preact/compat';
import type { AdminRoomSearch } from '../../admin_.rooms/loader';

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
    setQuery(event.currentTarget.value);
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const handleSort = (event: ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, order] = event.currentTarget.value.split(':');

    if (
      (sortBy !== 'listeners' && sortBy !== 'playlistItems') ||
      (order !== 'asc' && order !== 'desc')
    ) {
      return;
    }

    onSort(sortBy, order);
  };

  return (
    <form
      className="panel-surface border-theme flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row"
      onSubmit={handleSearch}
    >
      <input
        className="border-theme bg-theme-surface text-theme placeholder:text-theme-subtle focus:border-primary min-w-0 flex-1 rounded-xl border px-4 py-3 text-base outline-hidden transition-colors"
        disabled={disabled}
        maxLength={roomQueryMaximumLength}
        onChange={handleQueryChange}
        placeholder="Search rooms by name"
        type="search"
        value={query}
      />
      <select
        aria-label="Sort rooms"
        className="border-theme bg-theme-surface text-theme focus:border-primary rounded-xl border px-4 py-3 text-base outline-hidden transition-colors"
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
  { label: 'Most participants', value: 'listeners:desc' },
  { label: 'Fewest participants', value: 'listeners:asc' },
  { label: 'Most playlist items', value: 'playlistItems:desc' },
  { label: 'Fewest playlist items', value: 'playlistItems:asc' },
];

const roomQueryMaximumLength = 100;
