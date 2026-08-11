import type { AdminSearchUsagePoint } from '@vibes/models';
import { line, max, scaleLinear, scaleUtc, utcFormat } from 'd3';
import { type FocusEvent, type MouseEvent, useMemo, useState } from 'react';
import { getProviderDisplayName } from '../../shared';
import { Button } from '../components/Button';

interface SearchUsageChartProps {
  generatedAt: string;
  points: AdminSearchUsagePoint[];
}

interface SearchUsageBucket {
  cached: number;
  live: number;
  timestamp: Date;
  total: number;
}

interface SearchUsageMetric {
  id: 'cached' | 'live' | 'total';
  pointClassName: string;
}

export function SearchUsageChart({
  generatedAt,
  points,
}: SearchUsageChartProps) {
  const [selectedWindow, setSelectedWindow] = useState('hour');
  const [selectedProvider, setSelectedProvider] = useState(allProviders);
  const [hoveredBucket, setHoveredBucket] = useState<SearchUsageBucket | null>(
    null,
  );
  const providers = useMemo(
    () =>
      Array.from(new Set(points.map((point) => point.provider))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [points],
  );
  const activeProvider =
    selectedProvider === allProviders || providers.includes(selectedProvider)
      ? selectedProvider
      : allProviders;
  const buckets = useMemo(
    () =>
      generateSearchUsageBuckets(
        points,
        generatedAt,
        selectedWindow,
        activeProvider,
      ),
    [activeProvider, generatedAt, points, selectedWindow],
  );
  const highestTotal = max(buckets, (bucket) => bucket.total) ?? 0;
  const shownUsage = buckets.reduce(
    (usage, bucket) => ({
      cached: usage.cached + bucket.cached,
      live: usage.live + bucket.live,
      total: usage.total + bucket.total,
    }),
    { cached: 0, live: 0, total: 0 },
  );
  const xScale = scaleUtc()
    .domain([
      buckets[0]?.timestamp ?? new Date(),
      buckets[buckets.length - 1]?.timestamp ?? new Date(),
    ])
    .range([chartLeft, chartRight]);
  const yScale = scaleLinear()
    .domain([0, Math.max(highestTotal, minimumSearchDomain)])
    .nice()
    .range([chartBottom, chartTop]);
  const yTicks = yScale.ticks(chartTickCount);
  const xTicks = xScale.ticks(chartTickCount);
  const totalPath = generateSearchUsagePath(buckets, xScale, yScale, 'total');
  const cachedPath = generateSearchUsagePath(buckets, xScale, yScale, 'cached');
  const livePath = generateSearchUsagePath(buckets, xScale, yScale, 'live');
  const hoveredX = getSearchUsageTooltipX(hoveredBucket, xScale);
  const bucketHitWidth =
    (chartRight - chartLeft) / Math.max(buckets.length - 1, 1);

  const handleWindowChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedWindow(event.currentTarget.value);
  };

  const handleProviderChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedProvider(event.currentTarget.value);
  };

  const handleBucketEnter = (
    event: FocusEvent<SVGRectElement> | MouseEvent<SVGRectElement>,
  ) => {
    const timestamp = Number(event.currentTarget.dataset.timestamp);
    const bucket = buckets.find(
      (candidate) => candidate.timestamp.getTime() === timestamp,
    );
    if (!bucket) {
      return;
    }

    setHoveredBucket(bucket);
  };

  const handleBucketLeave = () => {
    setHoveredBucket(null);
  };

  return (
    <div className="glass mb-4 rounded-2xl border-2 border-ink/10 p-5 dark:border-gray-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-lg">Search activity</h3>
          <p className="text-ink/50 text-xs dark:text-gray-500">
            Searches in each {selectedWindow === 'hour' ? 'hour' : 'day'}. Quiet
            intervals are shown as zero.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {searchUsageWindows.map((window) => (
            <Button
              aria-pressed={selectedWindow === window.id}
              key={window.id}
              onClick={handleWindowChange}
              size="small"
              value={window.id}
              variant={selectedWindow === window.id ? 'primary' : 'tertiary'}
            >
              {window.label}
            </Button>
          ))}
        </div>
      </div>

      <fieldset className="mt-4 flex flex-wrap gap-2">
        <legend className="sr-only">Search provider</legend>
        <Button
          aria-pressed={activeProvider === allProviders}
          onClick={handleProviderChange}
          size="small"
          value={allProviders}
          variant={
            activeProvider === allProviders ? 'tertiary-active' : 'tertiary'
          }
        >
          All providers
        </Button>
        {providers.map((provider) => (
          <Button
            aria-pressed={activeProvider === provider}
            key={provider}
            onClick={handleProviderChange}
            size="small"
            value={provider}
            variant={
              activeProvider === provider ? 'tertiary-active' : 'tertiary'
            }
          >
            {getProviderDisplayName(provider)}
          </Button>
        ))}
      </fieldset>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-black text-2xl text-ink dark:text-white">
          {shownUsage.total.toLocaleString()} searches
        </p>
        <p className="text-ink/50 text-xs dark:text-gray-500">
          in the displayed {selectedWindow === 'hour' ? '24 hours' : '30 days'}{' '}
          · {shownUsage.live.toLocaleString()} live ·{' '}
          {shownUsage.cached.toLocaleString()} cached
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-ink/60 text-xs dark:text-gray-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Total
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
          Live
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
          Cached
        </span>
      </div>

      {!generatedAt && (
        <p className="py-16 text-center text-ink/50 text-sm dark:text-gray-500">
          Search activity is unavailable.
        </p>
      )}

      {generatedAt && (
        <div className="mt-3 overflow-x-auto">
          <svg
            aria-label={`${activeProvider === allProviders ? 'All provider' : activeProvider} search activity for the last ${selectedWindow === 'hour' ? '24 hours' : '30 days'}`}
            className="w-full min-w-xl"
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  className="stroke-ink/10 dark:stroke-gray-700"
                  x1={chartLeft}
                  x2={chartRight}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                />
                <text
                  className="fill-ink/50 text-xs dark:fill-gray-500"
                  textAnchor="end"
                  x={chartLeft - chartAxisGap}
                  y={yScale(tick) + chartTickOffset}
                >
                  {tick}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <text
                className="fill-ink/50 text-xs dark:fill-gray-500"
                key={tick.toISOString()}
                textAnchor="middle"
                x={xScale(tick)}
                y={chartBottom + chartLabelGap}
              >
                {formatSearchUsageTick(tick, selectedWindow)}
              </text>
            ))}
            <path
              className="fill-none stroke-violet-400"
              d={cachedPath ?? undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={supportingLineWidth}
            />
            <path
              className="fill-none stroke-cyan-400"
              d={livePath ?? undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={supportingLineWidth}
            />
            <path
              className="fill-none stroke-primary"
              d={totalPath ?? undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={totalLineWidth}
            />
            {searchUsageMetrics.map((metric) =>
              buckets.map((bucket) => (
                <circle
                  className={`${metric.pointClassName} pointer-events-none stroke-theme-surface`}
                  cx={xScale(bucket.timestamp)}
                  cy={yScale(bucket[metric.id])}
                  key={`${metric.id}-${bucket.timestamp.toISOString()}`}
                  r={pointRadius}
                  strokeWidth={pointStrokeWidth}
                />
              )),
            )}
            {buckets.map((bucket) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: SVG buckets expose hover and focus details without an action.
              <rect
                aria-label={formatSearchUsagePoint(bucket, selectedWindow)}
                className="fill-transparent"
                data-timestamp={bucket.timestamp.getTime()}
                height={chartBottom - chartTop}
                key={bucket.timestamp.toISOString()}
                onBlur={handleBucketLeave}
                onFocus={handleBucketEnter}
                onMouseEnter={handleBucketEnter}
                onMouseLeave={handleBucketLeave}
                tabIndex={0}
                width={bucketHitWidth}
                x={xScale(bucket.timestamp) - bucketHitWidth / 2}
                y={chartTop}
              />
            ))}
            {hoveredBucket && (
              <g pointerEvents="none">
                <rect
                  className="fill-theme-surface stroke-ink/20 dark:stroke-gray-600"
                  height={tooltipHeight}
                  rx={tooltipRadius}
                  width={tooltipWidth}
                  x={hoveredX}
                  y={tooltipTop}
                />
                <text
                  className="fill-ink/60 text-xs dark:fill-gray-400"
                  x={hoveredX + tooltipPadding}
                  y={tooltipTop + tooltipTimestampOffset}
                >
                  {formatSearchUsageTimestamp(
                    hoveredBucket.timestamp,
                    selectedWindow,
                  )}
                </text>
                <text
                  className="fill-primary font-bold text-xs"
                  x={hoveredX + tooltipPadding}
                  y={tooltipTop + tooltipTotalOffset}
                >
                  Total {hoveredBucket.total.toLocaleString()}
                </text>
                <text
                  className="fill-cyan-400 text-xs"
                  x={hoveredX + tooltipPadding}
                  y={tooltipTop + tooltipLiveOffset}
                >
                  Live {hoveredBucket.live.toLocaleString()}
                </text>
                <text
                  className="fill-violet-400 text-xs"
                  x={hoveredX + tooltipMetricOffset}
                  y={tooltipTop + tooltipLiveOffset}
                >
                  Cached {hoveredBucket.cached.toLocaleString()}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}

function generateSearchUsageBuckets(
  points: AdminSearchUsagePoint[],
  generatedAt: string,
  window: string,
  provider: string,
) {
  if (!generatedAt) {
    return [];
  }

  const matchingPoints = points.filter(
    (point) =>
      point.window === window &&
      (provider === allProviders || point.provider === provider),
  );
  const usageByTimestamp = new Map<number, SearchUsageBucket>();
  for (const point of matchingPoints) {
    const timestamp = new Date(point.timestamp);
    const key = timestamp.getTime();
    const current = usageByTimestamp.get(key);
    usageByTimestamp.set(key, {
      cached: (current?.cached ?? 0) + point.cached,
      live: (current?.live ?? 0) + point.live,
      timestamp,
      total: (current?.total ?? 0) + point.total,
    });
  }

  const end = floorSearchUsageDate(new Date(generatedAt), window);
  const start = new Date(end);
  if (window === 'hour') {
    start.setUTCHours(start.getUTCHours() - hourlyBucketOffset);
  } else {
    start.setUTCDate(start.getUTCDate() - dailyBucketOffset);
  }

  const buckets: SearchUsageBucket[] = [];
  let timestamp = start;
  while (timestamp.getTime() <= end.getTime()) {
    const existing = usageByTimestamp.get(timestamp.getTime());
    buckets.push(
      existing ?? {
        cached: 0,
        live: 0,
        timestamp,
        total: 0,
      },
    );
    timestamp = incrementSearchUsageDate(timestamp, window);
  }

  return buckets;
}

function generateSearchUsagePath(
  buckets: SearchUsageBucket[],
  xScale: (timestamp: Date) => number,
  yScale: (value: number) => number,
  value: 'cached' | 'live' | 'total',
) {
  return line<SearchUsageBucket>()
    .x((bucket) => xScale(bucket.timestamp))
    .y((bucket) => yScale(bucket[value]))(buckets);
}

function floorSearchUsageDate(date: Date, window: string) {
  if (window === 'hour') {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
      ),
    );
  }

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function incrementSearchUsageDate(date: Date, window: string) {
  const next = new Date(date);
  if (window === 'hour') {
    next.setUTCHours(next.getUTCHours() + 1);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function formatSearchUsageTick(date: Date, window: string) {
  if (window === 'hour') {
    return utcFormat('%H:00')(date);
  }

  return utcFormat('%d %b')(date);
}

function formatSearchUsagePoint(bucket: SearchUsageBucket, window: string) {
  const timestamp = formatSearchUsageTimestamp(bucket.timestamp, window);

  return `${timestamp}: ${bucket.total} total, ${bucket.live} live, ${bucket.cached} cached`;
}

function formatSearchUsageTimestamp(timestamp: Date, window: string) {
  if (window === 'hour') {
    return utcFormat('%d %b %H:00 UTC')(timestamp);
  }

  return utcFormat('%d %b %Y')(timestamp);
}

function getSearchUsageTooltipX(
  bucket: SearchUsageBucket | null,
  xScale: (timestamp: Date) => number,
) {
  if (!bucket) {
    return chartLeft;
  }

  const centered = xScale(bucket.timestamp) - tooltipWidth / 2;
  return Math.min(Math.max(centered, chartLeft), chartRight - tooltipWidth);
}

const searchUsageWindows = [
  { id: 'hour', label: '24 hours' },
  { id: 'day', label: '30 days' },
];

const searchUsageMetrics: SearchUsageMetric[] = [
  { id: 'total', pointClassName: 'fill-primary' },
  { id: 'live', pointClassName: 'fill-cyan-400' },
  { id: 'cached', pointClassName: 'fill-violet-400' },
];

const allProviders = 'all';

const chartWidth = 720;
const chartHeight = 320;
const chartLeft = 52;
const chartRight = 696;
const chartTop = 30;
const chartBottom = 270;
const chartTickCount = 5;
const chartAxisGap = 10;
const chartTickOffset = 4;
const chartLabelGap = 24;
const totalLineWidth = 4;
const supportingLineWidth = 2;
const pointRadius = 3;
const pointStrokeWidth = 2;
const tooltipWidth = 178;
const tooltipHeight = 66;
const tooltipTop = 34;
const tooltipRadius = 8;
const tooltipPadding = 10;
const tooltipMetricOffset = 88;
const tooltipTimestampOffset = 16;
const tooltipTotalOffset = 34;
const tooltipLiveOffset = 52;
const minimumSearchDomain = 1;
const hourlyBucketOffset = 23;
const dailyBucketOffset = 29;
