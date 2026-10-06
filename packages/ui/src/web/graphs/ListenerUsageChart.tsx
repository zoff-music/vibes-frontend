import type { AdminListenerUsage } from '@vibes/models';
import { useState } from 'react';
import { SegmentedControl } from '../components/SegmentedControl';
import { RoomUsageChart } from './RoomUsageChart';

export function ListenerUsageChart({
  generatedAt,
  points,
  roomPoints = [],
}: AdminListenerUsage) {
  const [period, setPeriod] = useState('day');
  const end = new Date(generatedAt || 0);
  end.setUTCSeconds(0, 0);
  if (period !== 'hour') end.setUTCMinutes(0);
  if (period === 'week' || period === 'month') end.setUTCHours(0);

  const start = new Date(end);
  if (period === 'hour') start.setUTCMinutes(0);
  if (period === 'day') start.setUTCHours(0);
  if (period === 'week')
    start.setUTCDate(start.getUTCDate() - (start.getUTCDay() || 7) + 1);
  if (period === 'month') start.setUTCDate(1);

  const step =
    period === 'hour' ? 60000 : period === 'day' ? 3600000 : 86400000;
  const counts = new Map(
    points
      .filter((point) => point.window === period)
      .map((point) => [new Date(point.timestamp).getTime(), point.listeners]),
  );
  const attributed = roomPoints.filter((point) => point.window === period);
  const buckets = Array.from(
    { length: Math.floor((end.getTime() - start.getTime()) / step) + 1 },
    (_, index) => {
      const timestamp = new Date(start.getTime() + index * step);

      return {
        timestamp,
        total: counts.get(timestamp.getTime()) ?? 0,
        rooms: attributed
          .filter(
            (point) =>
              new Date(point.timestamp).getTime() === timestamp.getTime(),
          )
          .map((point) => ({
            roomId: point.roomId,
            ...(point.roomType && { roomType: point.roomType }),
            value: point.listeners,
          })),
      };
    },
  );

  return (
    <div className="panel-surface rounded-2xl border border-theme p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl
          label="Audience aggregation"
          options={[
            { value: 'hour', label: 'Hour' },
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <p className="text-sm text-theme-muted">
          Peak{' '}
          {Math.max(
            0,
            ...buckets.map((bucket) => bucket.total),
          ).toLocaleString()}{' '}
          · Latest {buckets[buckets.length - 1]?.total ?? 0}
        </p>
      </div>
      <p className="mt-4 text-theme-muted text-xs">
        Each stack shows listeners and watchers at the overall peak minute in
        that interval, not the sum of separate room peaks.
      </p>
      <RoomUsageChart
        buckets={buckets}
        label="Participants"
        tickFormat={period === 'hour' || period === 'day' ? '%H:%M' : '%d %b'}
      />
    </div>
  );
}
