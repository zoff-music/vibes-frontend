import type { AdminMessageUsage } from '@vibes/models';
import { useState } from 'react';
import { SegmentedControl } from '../components/SegmentedControl';
import { RoomUsageChart } from './RoomUsageChart';

interface MessageUsageChartProps {
  usage: AdminMessageUsage;
}

export function MessageUsageChart({ usage }: MessageUsageChartProps) {
  const [period, setPeriod] = useState('hour');
  const end = new Date(usage.generatedAt || 0);
  end.setUTCMinutes(0, 0, 0);
  if (period !== 'hour') end.setUTCHours(0);
  if (period === 'month') end.setUTCDate(1);

  const length = period === 'hour' ? 24 : period === 'day' ? 30 : 12;
  const counts = new Map(
    usage.points
      .filter((point) => point.window === period)
      .map((point) => [new Date(point.timestamp).getTime(), point.messages]),
  );
  const roomPoints = (usage.roomPoints ?? []).filter(
    (point) => point.window === period,
  );
  const buckets = Array.from({ length }, (_, index) => {
    const timestamp = new Date(end);
    const offset = length - index - 1;
    if (period === 'hour')
      timestamp.setUTCHours(timestamp.getUTCHours() - offset);
    if (period === 'day') timestamp.setUTCDate(timestamp.getUTCDate() - offset);
    if (period === 'month')
      timestamp.setUTCMonth(timestamp.getUTCMonth() - offset);

    return {
      timestamp,
      total: counts.get(timestamp.getTime()) ?? 0,
      rooms: roomPoints
        .filter(
          (point) =>
            new Date(point.timestamp).getTime() === timestamp.getTime(),
        )
        .map((point) => ({
          roomId: point.roomId,
          ...(point.roomType && { roomType: point.roomType }),
          value: point.messages,
        })),
    };
  });

  return (
    <div className="panel-surface rounded-2xl border border-theme p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl
          label="Chat aggregation"
          options={[
            { value: 'hour', label: '24 hours' },
            { value: 'day', label: '30 days' },
            { value: 'month', label: '12 months' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <p className="text-sm text-theme-muted">
          {buckets
            .reduce((sum, bucket) => sum + bucket.total, 0)
            .toLocaleString()}{' '}
          in view · {usage.total.toLocaleString()} total
        </p>
      </div>
      <RoomUsageChart
        buckets={buckets}
        label="Messages"
        tickFormat={
          period === 'hour' ? '%H:%M' : period === 'month' ? '%b %Y' : '%d %b'
        }
      />
    </div>
  );
}
