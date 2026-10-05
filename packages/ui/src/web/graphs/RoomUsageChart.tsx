import { classNames } from '@vibes/shared';
import { area, line, scaleLinear, utcFormat } from 'd3';
import { useId, useState } from 'react';
import { Tooltip } from '../components/Tooltip';

export interface RoomUsageValue {
  roomId: string;
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
}: RoomUsageChartProps) {
  const id = useId();
  const [selectedRoom, setSelectedRoom] = useState('*');
  const roomTotals = new Map<string, number>();

  for (const bucket of buckets) {
    for (const room of bucket.rooms) {
      if (!room.roomId) continue;
      roomTotals.set(
        room.roomId,
        (roomTotals.get(room.roomId) ?? 0) + room.value,
      );
    }
  }

  const rooms = [...roomTotals].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const activeRoom =
    selectedRoom === '*' || roomTotals.has(selectedRoom) ? selectedRoom : '*';
  const paletteRooms = rooms.map(([room]) => room).sort();
  const color = (room: string) => roomColor(room, paletteRooms.indexOf(room));
  const roomSeries =
    activeRoom === '*'
      ? [...rooms.map(([room]) => room), '*unknown']
      : [activeRoom];
  const series = roomSeries.flatMap<RoomUsageSeries>((room) => {
    if (showCacheSplit) {
      return [
        {
          room,
          metric: 'live' as const,
          label: `${roomLabel(room)} · Uncached`,
        },
        {
          room,
          metric: 'cached' as const,
          label: `${roomLabel(room)} · Cached`,
        },
      ];
    }

    return [{ room, metric: 'value' as const, label: roomLabel(room) }];
  });
  const chartBuckets = buckets.map((bucket) => {
    const counts = new Map(bucket.rooms.map((room) => [room.roomId, room]));
    const values = series.map(({ room, metric }) => {
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

    return {
      ...bucket,
      values,
      shownTotal,
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-sm text-theme">{label} by room</p>
          <p className="mt-1 text-theme-muted text-xs">
            Hover, focus or tap an interval for exact counts. Times are UTC.
          </p>
        </div>
        {showCacheSplit && (
          <p className="text-theme-muted text-xs">
            Solid: uncached · Dashed: cached. Both stack within each room.
          </p>
        )}
        <label htmlFor={id} className="space-y-1 text-sm text-theme-muted">
          <span className="block">Room breakdown</span>
          <select
            id={id}
            value={activeRoom}
            onChange={(event) => setSelectedRoom(event.target.value)}
            className="max-w-64 rounded-lg border border-theme bg-theme-surface px-3 py-2 text-theme focus-visible:outline-2 focus-visible:outline-secondary"
          >
            <option value="*">All rooms</option>
            {rooms.map(([room]) => (
              <option key={room} value={room}>
                {roomLabel(room)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-theme bg-theme-surface p-3">
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
                <g key={path.label} className={color(path.room)}>
                  <path
                    d={path.area}
                    fill="currentColor"
                    fillOpacity={path.metric === 'cached' ? 0.06 : 0.18}
                  />
                  <path
                    d={path.line}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeDasharray={path.metric === 'cached' ? '5 4' : 'none'}
                    strokeOpacity={path.metric === 'cached' ? 0.65 : 1}
                  />
                  {path.points.map((point, index) => (
                    <circle
                      key={chartBuckets[index].timestamp.toISOString()}
                      cx={point.x}
                      cy={point.top}
                      r={2.5}
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
                  <span className="block w-72 space-y-2 whitespace-normal font-sans text-sm">
                    <span className="block text-theme-muted">
                      {timestampFormat(bucket.timestamp)}
                    </span>
                    <span className="block font-bold">
                      {bucket.shownTotal.toLocaleString()} {label.toLowerCase()}
                    </span>
                    {!showCacheSplit && bucket.detail && activeRoom === '*' && (
                      <span className="block text-theme-muted text-xs">
                        {bucket.detail}
                      </span>
                    )}
                    {showCacheSplit && (
                      <span className="grid grid-cols-[1fr_4rem_4rem] gap-2 text-theme-muted text-xs">
                        <span>Room</span>
                        <span className="text-right">Uncached</span>
                        <span className="text-right">Cached</span>
                      </span>
                    )}
                    {visibleRooms.map((room) => {
                      const index = series.findIndex(
                        (entry) => entry.room === room,
                      );

                      return (
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
                            <span className="truncate">{roomLabel(room)}</span>
                          </span>
                          <span className="text-right tabular-nums">
                            {bucket.values[index].toLocaleString()}
                          </span>
                          {showCacheSplit && (
                            <span className="text-right tabular-nums">
                              {bucket.values[index + 1].toLocaleString()}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                }
              >
                <button
                  type="button"
                  className="h-full w-full cursor-crosshair rounded-sm hover:bg-secondary/10 focus-visible:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-secondary"
                  aria-label={`${timestampFormat(bucket.timestamp)}: ${bucket.shownTotal} ${label.toLowerCase()}. ${series.map((entry, index) => `${entry.label}: ${bucket.values[index]}`).join(', ')}`}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      {maximum === 1 &&
        chartBuckets.every((bucket) => bucket.shownTotal === 0) && (
          <p className="text-sm text-theme-muted">
            No activity in this period.
          </p>
        )}
      <ul
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-theme-muted"
        aria-label="Room legend"
      >
        {visibleRooms.map((room) => (
          <li key={room} className="flex items-center gap-2">
            <svg viewBox="0 0 8 8" className="h-2.5 w-2.5" aria-hidden="true">
              <rect
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                className={color(room)}
              />
            </svg>
            {roomLabel(room)}
          </li>
        ))}
      </ul>
      <p className="text-theme-subtle text-xs">
        Older activity and clients without a room ID are shown as unattributed.
        Select a room to inspect it individually.
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
