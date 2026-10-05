import type { AdminSearchUsage } from '@vibes/models';
import { useState } from 'react';
import { getProviderDisplayName } from '../../shared';
import { SegmentedControl } from '../components/SegmentedControl';
import { RoomUsageChart } from './RoomUsageChart';

export function SearchUsageChart({
  generatedAt,
  points,
  roomPoints = [],
}: AdminSearchUsage) {
  const [period, setPeriod] = useState('hour');
  const [provider, setProvider] = useState('all');
  const providers = [...new Set(points.map((point) => point.provider))].sort();
  const matches = (point: { window: string; provider: string }) =>
    point.window === period &&
    (provider === 'all' || provider === point.provider);
  const totals = points.filter(matches);
  const attributed = roomPoints.filter(matches);
  const end = new Date(generatedAt || 0);
  end.setUTCMinutes(0, 0, 0);
  if (period === 'day') end.setUTCHours(0);

  const length = period === 'hour' ? 24 : 30;
  const buckets = Array.from({ length }, (_, index) => {
    const timestamp = new Date(end);
    const offset = length - index - 1;
    if (period === 'hour')
      timestamp.setUTCHours(timestamp.getUTCHours() - offset);
    if (period === 'day') timestamp.setUTCDate(timestamp.getUTCDate() - offset);

    const matching = totals.filter(
      (point) => new Date(point.timestamp).getTime() === timestamp.getTime(),
    );
    const rooms = new Map<string, number>();
    for (const point of attributed) {
      if (new Date(point.timestamp).getTime() !== timestamp.getTime()) continue;
      rooms.set(point.roomId, (rooms.get(point.roomId) ?? 0) + point.total);
    }

    return {
      timestamp,
      total: matching.reduce((sum, point) => sum + point.total, 0),
      rooms: [...rooms].map(([roomId, value]) => ({ roomId, value })),
      detail: `${matching.reduce((sum, point) => sum + point.live, 0)} live · ${matching.reduce((sum, point) => sum + point.cached, 0)} cached`,
    };
  });

  return (
    <div className="panel-surface rounded-2xl border border-theme p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl
          label="Search aggregation"
          options={[
            { value: 'hour', label: '24 hours' },
            { value: 'day', label: '30 days' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <SegmentedControl
          label="Search provider"
          options={[
            { value: 'all', label: 'All providers' },
            ...providers.map((value) => ({
              value,
              label: getProviderDisplayName(value),
            })),
          ]}
          value={provider}
          onChange={setProvider}
        />
      </div>
      <p className="mt-4 text-sm text-theme-muted">
        {totals.reduce((sum, point) => sum + point.total, 0).toLocaleString()}{' '}
        searches ·{' '}
        {totals.reduce((sum, point) => sum + point.live, 0).toLocaleString()}{' '}
        live ·{' '}
        {totals.reduce((sum, point) => sum + point.cached, 0).toLocaleString()}{' '}
        cached
      </p>
      <RoomUsageChart
        buckets={buckets}
        label="Searches"
        tickFormat={period === 'hour' ? '%H:%M' : '%d %b'}
      />
    </div>
  );
}
