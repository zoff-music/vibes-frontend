import type { AdminMessageUsage } from '@vibes/models';
import { useState } from 'react';
import { SegmentedControl } from '../components/SegmentedControl';

interface MessageUsageChartProps {
  usage: AdminMessageUsage;
}

export function MessageUsageChart({ usage }: MessageUsageChartProps) {
  const [period, setPeriod] = useState('hour');
  const buckets = messageBuckets(usage, period);
  const maximum = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const formatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'short',
    ...(period !== 'month' && { day: 'numeric' }),
    ...(period === 'hour' && { hour: '2-digit' }),
    ...(period === 'month' && { year: 'numeric' }),
  });

  return (
    <div className="rounded-2xl border border-theme bg-theme-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl
          label="Chat aggregation"
          options={[
            { value: 'hour', label: 'Hourly' },
            { value: 'day', label: 'Daily' },
            { value: 'month', label: 'Monthly' },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <p className="text-sm text-theme-muted">
          {total.toLocaleString()} in view · {usage.total.toLocaleString()}{' '}
          total
        </p>
      </div>
      <svg
        viewBox="0 0 720 230"
        role="img"
        aria-label={`${total} chat messages in the displayed ${period}ly buckets. Exact counts below.`}
        className="mt-5 w-full text-secondary"
      >
        <line
          x1="0"
          x2="720"
          y1="200"
          y2="200"
          stroke="currentColor"
          opacity="0.2"
        />
        {buckets.map((bucket, index) => {
          const width = 720 / buckets.length;
          const height = (bucket.count / maximum) * 180;
          return (
            <g key={bucket.date.toISOString()}>
              <title>
                {formatDate.format(bucket.date)} UTC: {bucket.count}
              </title>
              <rect
                x={index * width + 2}
                y={200 - height}
                width={Math.max(1, width - 4)}
                height={height}
                rx="2"
                fill="currentColor"
              />
              {index % Math.ceil(buckets.length / 5) === 0 && (
                <text
                  x={index * width + 2}
                  y="222"
                  fill="currentColor"
                  fontSize="11"
                >
                  {formatDate.format(bucket.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-secondary">
          View counts (UTC)
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col" className="text-right">
                  Messages
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr
                  key={bucket.date.toISOString()}
                  className="border-theme border-b"
                >
                  <th scope="row" className="py-2 font-normal">
                    {formatDate.format(bucket.date)}
                  </th>
                  <td className="text-right">
                    {bucket.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function messageBuckets(usage: AdminMessageUsage, period: string) {
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
  return Array.from({ length }, (_, index) => {
    const date = new Date(end);
    const offset = length - index - 1;
    if (period === 'hour') date.setUTCHours(date.getUTCHours() - offset);
    if (period === 'day') date.setUTCDate(date.getUTCDate() - offset);
    if (period === 'month') date.setUTCMonth(date.getUTCMonth() - offset);
    return { date, count: counts.get(date.getTime()) ?? 0 };
  });
}
