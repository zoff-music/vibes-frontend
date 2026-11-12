import { classNames } from '@vibes/shared';
import { area, line, scaleLinear, utcFormat } from 'd3';
import { useId, useState } from 'preact/compat';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SegmentedControl } from '../components/SegmentedControl';
import { Tooltip } from '../components/Tooltip';

export interface RoomUsageValue {
  roomId: string;
  roomName?: string;
  roomType?: 'MUSIC' | 'WATCH';
  value: number;
  cached?: number;
  live?: number;
}

export interface RoomUsageBucket {
  timestamp: Date;
  total: number;
  rooms: RoomUsageValue[];
  detail?: string;
  cached?: number;
  live?: number;
}

interface RoomUsageChartProps {
  buckets: RoomUsageBucket[];
  label: string;
  tickFormat: string;
  showCacheSplit?: boolean;
  summaryMode?: 'total' | 'peak';
}

interface RoomUsageSeries {
  room: string;
  metric: 'value' | 'live' | 'cached';
  label: string;
}

export function RoomUsageChart({
  buckets,
  label,
  tickFormat,
  showCacheSplit = false,
  summaryMode = 'total',
}: RoomUsageChartProps) {
  const id = useId();
  const [selectedRoom, setSelectedRoom] = useState('*');
  const [selectedType, setSelectedType] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const roomNames = new Map<string, string>();
  const roomTypes = new Map<string, RoomUsageValue['roomType']>();
  const roomTotals = new Map<string, number>();

  for (const bucket of buckets) {
    for (const room of bucket.rooms) {
      if (!room.roomId) continue;

      roomTypes.set(room.roomId, room.roomType);
      if (room.roomName) roomNames.set(room.roomId, room.roomName);
      roomTotals.set(
        room.roomId,
        summaryMode === 'peak'
          ? Math.max(roomTotals.get(room.roomId) ?? 0, room.value)
          : (roomTotals.get(room.roomId) ?? 0) + room.value,
      );
    }
  }

  const allRooms = [...roomTotals].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const rooms = allRooms.filter(
    ([room]) => selectedType === 'all' || roomTypes.get(room) === selectedType,
  );
  const describeRoom = (room: string) => {
    const type = roomTypes.get(room);
    const typeLabel =
      type === 'WATCH' ? 'Watch' : type === 'MUSIC' ? 'Music' : 'Unknown type';

    if (room === '*other')
      return `Other rooms (${Math.max(0, rooms.length - 5)})`;

    return room === '*unknown'
      ? roomLabel(room)
      : `${typeLabel} · ${roomNames.get(room) || roomLabel(room)}`;
  };
  const activeRoom =
    selectedRoom === '*' || rooms.some(([room]) => room === selectedRoom)
      ? selectedRoom
      : '*';
  const paletteRooms = rooms.slice(0, 5).map(([room]) => room);
  const otherRooms = new Set(rooms.slice(5).map(([room]) => room));
  const matchingRooms = rooms.filter(([room]) =>
    `${room} ${describeRoom(room)}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const activePage = Math.min(
    page,
    Math.max(0, Math.ceil(matchingRooms.length / 20) - 1),
  );
  const pageRooms = matchingRooms.slice(activePage * 20, (activePage + 1) * 20);
  const color = (room: string) => roomColor(room, paletteRooms.indexOf(room));
  const roomSeries =
    activeRoom === '*'
      ? [
          ...paletteRooms,
          ...(otherRooms.size > 0 ? ['*other'] : []),
          ...(selectedType === 'all' ? ['*unknown'] : []),
        ]
      : [activeRoom];
  const series = roomSeries.flatMap<RoomUsageSeries>((room) => {
    if (showCacheSplit) {
      return [
        {
          room,
          metric: 'live' as const,
          label: `${describeRoom(room)} · Uncached`,
        },
        {
          room,
          metric: 'cached' as const,
          label: `${describeRoom(room)} · Cached`,
        },
      ];
    }

    return [{ room, metric: 'value' as const, label: describeRoom(room) }];
  });
  const chartBuckets = buckets.map((bucket) => {
    const counts = new Map(bucket.rooms.map((room) => [room.roomId, room]));
    const values = series.map(({ room, metric }) => {
      if (room === '*other') {
        return bucket.rooms.reduce(
          (sum, entry) =>
            sum + (otherRooms.has(entry.roomId) ? (entry[metric] ?? 0) : 0),
          0,
        );
      }

      if (room === '*unknown') {
        const total = metric === 'value' ? bucket.total : (bucket[metric] ?? 0);
        const attributed = bucket.rooms.reduce(
          (sum, entry) => sum + (entry.roomId ? (entry[metric] ?? 0) : 0),
          0,
        );

        return Math.max(0, total - attributed);
      }

      return counts.get(room)?.[metric] ?? 0;
    });
    const shownTotal = values.reduce((sum, value) => sum + value, 0);
    const tooltipRooms = roomSeries
      .map((room) => {
        const index = series.findIndex((entry) => entry.room === room);
        const value = values[index];
        const cached = showCacheSplit ? values[index + 1] : 0;

        return { room, value, cached, total: value + cached };
      })
      .filter((room) => room.total > 0)
      .sort((a, b) => b.total - a.total || a.room.localeCompare(b.room));
    const tooltipDescription = tooltipRooms
      .map(({ room, value, cached, total }) => {
        if (!showCacheSplit) return `${describeRoom(room)}: ${total}`;

        const counts = [
          ...(value > 0 ? [`Uncached: ${value}`] : []),
          ...(cached > 0 ? [`Cached: ${cached}`] : []),
        ];

        return `${describeRoom(room)}: ${counts.join(', ')}`;
      })
      .join(', ');

    return {
      ...bucket,
      values,
      shownTotal,
      tooltipRooms,
      tooltipDescription,
    };
  });
  const maximum = Math.max(
    1,
    ...chartBuckets.map((bucket) => bucket.shownTotal),
  );
  const y = scaleLinear().domain([0, maximum]).nice(4).range([250, 16]);
  const step = 640 / Math.max(1, buckets.length);
  const timestampFormat = utcFormat('%d %b %Y, %H:%M UTC');
  const visibleRooms = roomSeries.filter((room) =>
    series.some(
      (entry, index) =>
        entry.room === room &&
        chartBuckets.some((bucket) => bucket.values[index] > 0),
    ),
  );
  const paths = series.map((entry, roomIndex) => {
    const points = chartBuckets.map((bucket, index) => {
      const bottom = bucket.values
        .slice(0, roomIndex)
        .reduce((sum, value) => sum + value, 0);

      return {
        x: 52 + (index + 0.5) * step,
        bottom: y(bottom),
        top: y(bottom + bucket.values[roomIndex]),
      };
    });

    return {
      ...entry,
      points,
      line:
        line<(typeof points)[number]>()
          .x((point) => point.x)
          .y((point) => point.top)(points) ?? '',
      area:
        area<(typeof points)[number]>()
          .x((point) => point.x)
          .y0((point) => point.bottom)
          .y1((point) => point.top)(points) ?? '',
    };
  });

  return (
    <div className="mt-5 space-y-4">
      <SegmentedControl
        label={`${label} room type`}
        options={[
          { value: 'all', label: 'All rooms' },
          { value: 'MUSIC', label: 'Music' },
          { value: 'WATCH', label: 'Watch' },
        ]}
        value={selectedType}
        onChange={(value) => {
          setSelectedType(value);
          setSelectedRoom('*');
          setPage(0);
        }}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-theme text-sm font-semibold">{label} by room</p>
          <p className="text-theme-muted mt-1 text-xs">
            Hover, focus or tap an interval for exact counts. Times are UTC.
          </p>
        </div>
        {showCacheSplit && (
          <p className="text-theme-muted text-xs">
            Solid: uncached · Dashed: cached. Both stack within each room.
          </p>
        )}
        {activeRoom !== '*' && (
          <Button
            variant="tertiary"
            size="small"
            onClick={() => setSelectedRoom('*')}
          >
            Back to top rooms
          </Button>
        )}
      </div>
      <p className="text-theme-muted text-sm" aria-live="polite">
        {activeRoom === '*' &&
          `Top ${Math.min(5, rooms.length)} of ${rooms.length} rooms by ${summaryMode === 'peak' ? 'peak audience' : 'activity'}. Remaining rooms are combined; no counts are dropped.`}
        {activeRoom !== '*' && describeRoom(activeRoom)}
      </p>
      <div className="border-theme bg-theme-surface overflow-x-auto rounded-xl border p-3">
        <div className="relative min-w-xl">
          <svg
            viewBox="0 0 720 290"
            role="img"
            aria-label={`${label} stacked by room${showCacheSplit ? ', uncached and cached' : ''}`}
            className="block w-full"
          >
            {y
              .ticks(4)
              .filter(Number.isInteger)
              .map((tick) => (
                <g key={tick}>
                  <line
                    x1={52}
                    x2={692}
                    y1={y(tick)}
                    y2={y(tick)}
                    className="stroke-theme"
                  />
                  <text
                    x={42}
                    y={y(tick) + 4}
                    textAnchor="end"
                    className="fill-theme-muted text-xs"
                  >
                    {tick.toLocaleString()}
                  </text>
                </g>
              ))}
            {paths
              .filter((path) =>
                path.points.some((point) => point.top < point.bottom),
              )
              .map((path) => (
                <g
                  key={`${path.room}-${path.metric}`}
                  className={color(path.room)}
                >
                  <path
                    d={path.area}
                    fill="currentColor"
                    fillOpacity={path.metric === 'cached' ? 0.06 : 0.18}
                  />
                  <path
                    d={path.line}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeDasharray={path.metric === 'cached' ? '5 4' : 'none'}
                    strokeOpacity={path.metric === 'cached' ? 0.65 : 1}
                  />
                  {path.points.length === 1 &&
                    path.points.map((point) => (
                      <circle
                        key={path.room}
                        cx={point.x}
                        cy={point.top}
                        r={3}
                        fill="currentColor"
                      />
                    ))}
                </g>
              ))}
            {chartBuckets.map((bucket, index) => (
              <g key={bucket.timestamp.toISOString()}>
                {index % Math.ceil(chartBuckets.length / 6) === 0 && (
                  <text
                    x={52 + (index + 0.5) * step}
                    y={278}
                    textAnchor="middle"
                    className="fill-theme-muted text-xs"
                  >
                    {utcFormat(tickFormat)(bucket.timestamp)}
                  </text>
                )}
              </g>
            ))}
          </svg>
          <div className="absolute top-[5.517%] right-[3.889%] bottom-[13.793%] left-[7.222%] flex">
            {chartBuckets.map((bucket) => (
              <Tooltip
                key={bucket.timestamp.toISOString()}
                as="div"
                className="min-w-0 flex-1"
                content={
                  <span className="block w-72 space-y-2 font-sans text-sm whitespace-normal">
                    <span className="text-theme-muted block">
                      {timestampFormat(bucket.timestamp)}
                    </span>
                    <span className="block font-bold">
                      {bucket.shownTotal.toLocaleString()} {label.toLowerCase()}
                    </span>
                    {!showCacheSplit && bucket.detail && activeRoom === '*' && (
                      <span className="text-theme-muted block text-xs">
                        {bucket.detail}
                      </span>
                    )}
                    {showCacheSplit && (
                      <span className="text-theme-muted grid grid-cols-[1fr_4rem_4rem] gap-2 text-xs">
                        <span>Room</span>
                        <span className="text-right">Uncached</span>
                        <span className="text-right">Cached</span>
                      </span>
                    )}
                    {bucket.tooltipRooms.map(({ room, value, cached }) => (
                      <span
                        key={room}
                        className={classNames(
                          'grid gap-2',
                          showCacheSplit
                            ? 'grid-cols-[1fr_4rem_4rem]'
                            : 'grid-cols-[1fr_4rem]',
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <svg
                            viewBox="0 0 8 8"
                            className="h-2 w-2 shrink-0"
                            aria-hidden="true"
                          >
                            <rect
                              width="8"
                              height="8"
                              rx="2"
                              fill="currentColor"
                              className={color(room)}
                            />
                          </svg>
                          <span className="break-words">
                            {describeRoom(room)}
                          </span>
                        </span>
                        <span className="text-right tabular-nums">
                          {value > 0 && value.toLocaleString()}
                        </span>
                        {showCacheSplit && (
                          <span className="text-right tabular-nums">
                            {cached > 0 && cached.toLocaleString()}
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                }
              >
                <button
                  type="button"
                  className="hover:bg-secondary/10 focus-visible:bg-secondary/10 focus-visible:outline-secondary h-full w-full cursor-crosshair rounded-sm focus-visible:outline-2"
                  aria-label={`${timestampFormat(bucket.timestamp)}: ${bucket.shownTotal} ${label.toLowerCase()}. ${bucket.tooltipDescription}`}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      {maximum === 1 &&
        chartBuckets.every((bucket) => bucket.shownTotal === 0) && (
          <p className="text-theme-muted text-sm">
            No activity in this period.
          </p>
        )}
      <ul
        className="text-theme grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Room legend"
      >
        {visibleRooms.map((room) => (
          <li
            key={room}
            className="border-theme flex min-w-0 items-start gap-2 rounded-lg border p-3"
          >
            <svg
              viewBox="0 0 8 8"
              className="mt-1 h-2.5 w-2.5 shrink-0"
              aria-hidden="true"
            >
              <rect
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                className={color(room)}
              />
            </svg>
            <span className="min-w-0 flex-1 break-words">
              {describeRoom(room)}
            </span>
            <span className="shrink-0 font-sans tabular-nums">
              {(summaryMode === 'peak'
                ? Math.max(
                    0,
                    ...chartBuckets.map(
                      (bucket) =>
                        bucket.tooltipRooms.find((entry) => entry.room === room)
                          ?.total ?? 0,
                    ),
                  )
                : chartBuckets.reduce(
                    (sum, bucket) =>
                      sum +
                      (bucket.tooltipRooms.find((entry) => entry.room === room)
                        ?.total ?? 0),
                    0,
                  )
              ).toLocaleString()}
              <span className="text-theme-muted ml-1 text-xs">
                {summaryMode === 'peak' ? 'peak' : 'total'}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <details className="border-theme rounded-xl border p-4">
        <summary className="text-theme focus-visible:outline-secondary cursor-pointer text-sm font-semibold focus-visible:outline-2">
          Find a room · {rooms.length.toLocaleString()} rooms
        </summary>
        <Input
          id={id}
          label="Search room name or ID"
          type="search"
          value={query}
          containerClassName="mt-4"
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setPage(0);
          }}
        />
        <p className="text-theme-muted my-3 text-xs" aria-live="polite">
          {matchingRooms.length} matches · Ranked by{' '}
          {summaryMode === 'peak'
            ? 'peak participants at sampled intervals'
            : 'total activity in this period'}
        </p>
        <ul className="divide-theme divide-y">
          {pageRooms.map(([room, total]) => (
            <li key={room}>
              <Button
                variant={activeRoom === room ? 'tertiary-active' : 'ghost'}
                shape="rounded"
                contentAlignment="between"
                aria-pressed={activeRoom === room}
                onClick={() => setSelectedRoom(room)}
                className="w-full gap-4 text-left"
              >
                <span className="min-w-0 break-words">
                  {describeRoom(room)}
                  <span className="text-theme-muted block text-xs">{room}</span>
                </span>
                <span className="shrink-0 font-sans tabular-nums">
                  {total.toLocaleString()}
                </span>
              </Button>
            </li>
          ))}
        </ul>
        {matchingRooms.length === 0 && (
          <p className="text-theme-muted text-sm">No matching rooms.</p>
        )}
        {matchingRooms.length > 20 && (
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <Button
              variant="tertiary"
              size="small"
              disabled={activePage === 0}
              onClick={() => setPage(activePage - 1)}
            >
              Previous
            </Button>
            <span className="text-theme-muted">
              Page {activePage + 1} of {Math.ceil(matchingRooms.length / 20)}
            </span>
            <Button
              variant="tertiary"
              size="small"
              disabled={(activePage + 1) * 20 >= matchingRooms.length}
              onClick={() => setPage(activePage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </details>
      <p className="text-theme-subtle text-xs">
        Older activity and clients without a room ID are shown as unattributed.
        Select a room to inspect it individually. Unknown room types remain in
        All rooms only. Summary counts above the chart include both types; the
        chart filter changes the breakdown.
      </p>
    </div>
  );
}

function roomLabel(room: string) {
  if (room === '*unknown' || room === '') return 'Unattributed';

  return room;
}

function roomColor(room: string, index: number) {
  if (room === '*unknown' || room === '') return 'text-slate-400';
  if (room === '*other') return 'text-theme-muted';

  return classNames(roomColors[Math.max(0, index) % roomColors.length]);
}

const roomColors = [
  'text-cyan-400',
  'text-pink-500',
  'text-indigo-400',
  'text-teal-400',
  'text-rose-400',
  'text-sky-500',
  'text-fuchsia-400',
];
