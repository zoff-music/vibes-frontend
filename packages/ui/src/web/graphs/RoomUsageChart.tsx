import { classNames } from '@vibes/shared';
import { scaleLinear, utcFormat } from 'd3';
import { useId, useState } from 'react';
import { Tooltip } from '../components/Tooltip';

export interface RoomUsageValue {
  roomId: string;
  value: number;
}

export interface RoomUsageBucket {
  timestamp: Date;
  total: number;
  rooms: RoomUsageValue[];
  detail?: string;
}

interface RoomUsageChartProps {
  buckets: RoomUsageBucket[];
  label: string;
  tickFormat: string;
}

export function RoomUsageChart({
  buckets,
  label,
  tickFormat,
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
  const featured = rooms.slice(0, 7).map(([room]) => room);
  const paletteRooms = [...featured].sort();
  const color = (room: string) => roomColor(room, paletteRooms.indexOf(room));
  const series =
    activeRoom === '*'
      ? [...featured, ...(rooms.length > 7 ? ['*other'] : []), '*unknown']
      : [activeRoom];
  const chartBuckets = buckets.map((bucket) => {
    const counts = new Map(
      bucket.rooms.map((room) => [room.roomId, room.value]),
    );
    const attributed = bucket.rooms.reduce(
      (sum, room) => sum + (room.roomId ? room.value : 0),
      0,
    );
    const values = series.map((room) => {
      if (room === '*unknown') return Math.max(0, bucket.total - attributed);
      if (room === '*other')
        return bucket.rooms.reduce(
          (sum, entry) =>
            sum +
            (!entry.roomId || featured.includes(entry.roomId)
              ? 0
              : entry.value),
          0,
        );
      return counts.get(room) ?? 0;
    });

    return {
      ...bucket,
      values,
      shownTotal: values.reduce((sum, value) => sum + value, 0),
    };
  });
  const maximum = Math.max(
    1,
    ...chartBuckets.map((bucket) => bucket.shownTotal),
  );
  const y = scaleLinear().domain([0, maximum]).nice(4).range([250, 16]);
  const step = 640 / Math.max(1, buckets.length);
  const timestampFormat = utcFormat('%d %b %Y, %H:%M UTC');
  const visibleSeries = series.filter((_, index) =>
    chartBuckets.some((bucket) => bucket.values[index] > 0),
  );

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-sm text-theme">{label} by room</p>
          <p className="mt-1 text-theme-muted text-xs">
            Hover, focus or tap an interval for exact counts. Times are UTC.
          </p>
        </div>
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
            aria-label={`${label} stacked by room`}
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
            {chartBuckets.map((bucket, index) => {
              let cumulative = 0;

              return (
                <g key={bucket.timestamp.toISOString()}>
                  {bucket.values.map((value, roomIndex) => {
                    const bottom = cumulative;
                    cumulative += value;

                    return (
                      <rect
                        key={series[roomIndex]}
                        x={52 + index * step + 1}
                        y={y(cumulative)}
                        width={Math.max(1, step - 2)}
                        height={y(bottom) - y(cumulative)}
                        className={color(series[roomIndex])}
                      />
                    );
                  })}
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
              );
            })}
          </svg>
          <div className="absolute top-[5.517%] right-[3.889%] bottom-[13.793%] left-[7.222%] flex">
            {chartBuckets.map((bucket) => (
              <Tooltip
                key={bucket.timestamp.toISOString()}
                as="div"
                className="min-w-0 flex-1"
                content={
                  <span className="block w-64 space-y-2 whitespace-normal font-sans text-sm">
                    <span className="block text-theme-muted">
                      {timestampFormat(bucket.timestamp)}
                    </span>
                    <span className="block font-bold">
                      {bucket.shownTotal.toLocaleString()} {label.toLowerCase()}
                    </span>
                    {bucket.detail && activeRoom === '*' && (
                      <span className="block text-theme-muted text-xs">
                        {bucket.detail}
                      </span>
                    )}
                    {series.map(
                      (room, index) =>
                        bucket.values[index] > 0 && (
                          <span
                            key={room}
                            className="flex justify-between gap-4"
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
                                  className={color(room)}
                                />
                              </svg>
                              <span className="truncate">
                                {roomLabel(room)}
                              </span>
                            </span>
                            <span className="tabular-nums">
                              {bucket.values[index].toLocaleString()}
                            </span>
                          </span>
                        ),
                    )}
                  </span>
                }
              >
                <button
                  type="button"
                  className="h-full w-full cursor-crosshair rounded-sm hover:bg-secondary/10 focus-visible:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-secondary"
                  aria-label={`${timestampFormat(bucket.timestamp)}: ${bucket.shownTotal} ${label.toLowerCase()}. ${series.map((room, index) => `${roomLabel(room)}: ${bucket.values[index]}`).join(', ')}`}
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
        {visibleSeries.map((room) => (
          <li key={room} className="flex items-center gap-2">
            <svg viewBox="0 0 8 8" className="h-2.5 w-2.5" aria-hidden="true">
              <rect width="8" height="8" rx="2" className={color(room)} />
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
  if (room === '*other') return 'Other rooms';
  return room;
}

function roomColor(room: string, index: number) {
  if (room === '*unknown' || room === '') return 'fill-slate-400';
  if (room === '*other') return 'fill-violet-400';

  return classNames(roomColors[Math.max(0, index) % roomColors.length]);
}

const roomColors = [
  'fill-cyan-400',
  'fill-pink-500',
  'fill-indigo-400',
  'fill-teal-400',
  'fill-rose-400',
  'fill-sky-500',
  'fill-fuchsia-400',
];
