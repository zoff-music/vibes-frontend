import { Button, Input, SegmentedControl } from '@vibes/ui/web';
import { useEffect, useState } from 'react';
import { Form, useSubmit } from 'react-router';
import type { RoomBrowserSearch } from '../search';

interface RoomBrowserFiltersProps {
  search: RoomBrowserSearch;
  pending: boolean;
}

const roomFilters = [
  { value: 'true', label: 'Live rooms' },
  { value: 'false', label: 'All public rooms' },
];

export function RoomBrowserFilters({
  search,
  pending,
}: RoomBrowserFiltersProps) {
  const [query, setQuery] = useState(search.q);
  const [live, setLive] = useState(String(search.live));
  const submit = useSubmit();

  useEffect(() => {
    setQuery(search.q);
    setLive(String(search.live));
  }, [search.q, search.live]);

  const changeFilter = (value: string) => {
    setLive(value);
    submit(
      { q: query.trim(), live: value },
      { method: 'get', action: '/explore/rooms', preventScrollReset: true },
    );
  };

  return (
    <Form
      action="/explore/rooms"
      method="get"
      preventScrollReset
      role="search"
      aria-label="Find public rooms"
      className="grid items-end gap-5 border-theme border-b pb-7 md:grid-cols-2 md:gap-10"
    >
      <div>
        <p className="mb-2 text-sm text-theme-muted">Show rooms</p>
        <SegmentedControl
          label="Room activity"
          name="live"
          value={live}
          options={roomFilters}
          onChange={changeFilter}
        />
      </div>
      <div className="flex min-w-0 items-end gap-2">
        <Input
          label="Search by name"
          name="q"
          type="search"
          placeholder="Find a room…"
          maxLength={100}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          containerClassName="mb-0! min-w-0 flex-1"
        />
        <Button
          type="submit"
          disabled={pending}
          variant="tertiary"
          className="min-h-12 shrink-0 px-4 text-sm"
        >
          Search
        </Button>
      </div>
    </Form>
  );
}
