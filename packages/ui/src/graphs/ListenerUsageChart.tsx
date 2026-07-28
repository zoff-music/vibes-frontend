import type { ListenerUsagePoint } from '@vibes/models';
import { line, max, scaleLinear, scaleUtc, utcFormat } from 'd3';
import { type FocusEvent, type MouseEvent, useMemo, useState } from 'react';

interface ListenerUsageChartProps {
  generatedAt: string;
  points: ListenerUsagePoint[];
}

interface ListenerUsageBucket {
  listeners: number;
  timestamp: Date;
}

export function ListenerUsageChart({
  generatedAt,
  points,
}: ListenerUsageChartProps) {
  const [selectedWindow, setSelectedWindow] = useState('day');
  const [hoveredBucket, setHoveredBucket] =
    useState<ListenerUsageBucket | null>(null);
  const buckets = useMemo(
    () => generateListenerUsageBuckets(points, generatedAt, selectedWindow),
    [generatedAt, points, selectedWindow],
  );
  const highestListeners = max(buckets, (bucket) => bucket.listeners) ?? 0;
  const xScale = scaleUtc()
    .domain([
      buckets[0]?.timestamp ?? new Date(),
      buckets[buckets.length - 1]?.timestamp ?? new Date(),
    ])
    .range([chartLeft, chartRight]);
  const yScale = scaleLinear()
    .domain([0, Math.max(highestListeners, minimumListenerDomain)])
    .nice()
    .range([chartBottom, chartTop]);
  const yTicks = yScale.ticks(chartTickCount);
  const xTicks = xScale.ticks(chartTickCount);
  const path = line<ListenerUsageBucket>()
    .x((bucket) => xScale(bucket.timestamp))
    .y((bucket) => yScale(bucket.listeners))(buckets);
  const currentListeners = buckets[buckets.length - 1]?.listeners ?? 0;
  const hoveredX = getListenerUsageTooltipX(hoveredBucket, xScale);
  const bucketHitWidth =
    (chartRight - chartLeft) / Math.max(buckets.length - 1, 1);

  const handleWindowChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedWindow(event.currentTarget.value);
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
          <h3 className="font-bold text-lg">Listener activity</h3>
          <p className="text-ink/50 text-xs dark:text-gray-500">
            Peak concurrent listeners in each interval. Missing intervals had no
            listeners.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listenerUsageWindows.map((window) => (
            <button
              aria-pressed={selectedWindow === window.id}
              className={
                selectedWindow === window.id
                  ? 'rounded-lg bg-primary px-3 py-2 font-bold text-white text-xs'
                  : 'rounded-lg bg-ink/5 px-3 py-2 font-bold text-ink/60 text-xs transition-colors hover:bg-ink/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }
              key={window.id}
              onClick={handleWindowChange}
              type="button"
              value={window.id}
            >
              {window.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-6">
        <div>
          <p className="text-ink/50 text-xs uppercase tracking-wider dark:text-gray-500">
            Latest bucket
          </p>
          <p className="font-black text-2xl text-ink dark:text-white">
            {currentListeners}
          </p>
        </div>
        <div>
          <p className="text-ink/50 text-xs uppercase tracking-wider dark:text-gray-500">
            Peak
          </p>
          <p className="font-black text-2xl text-ink dark:text-white">
            {highestListeners}
          </p>
        </div>
      </div>

      {buckets.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <svg
            aria-label={`Listener activity for the current ${selectedWindow}`}
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
                {formatListenerUsageTick(tick, selectedWindow)}
              </text>
            ))}
            <path
              className="fill-none stroke-primary"
              d={path ?? undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={chartLineWidth}
            />
            {buckets.map((bucket) => (
              <circle
                className="pointer-events-none fill-primary stroke-theme-surface"
                cx={xScale(bucket.timestamp)}
                cy={yScale(bucket.listeners)}
                key={bucket.timestamp.toISOString()}
                r={pointRadius}
                strokeWidth={pointStrokeWidth}
              />
            ))}
            {buckets.map((bucket) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: SVG buckets expose hover and focus details without an action.
              <rect
                aria-label={formatListenerUsagePoint(bucket, selectedWindow)}
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
                  {formatListenerUsageTimestamp(
                    hoveredBucket.timestamp,
                    selectedWindow,
                  )}
                </text>
                <text
                  className="fill-primary font-bold text-xs"
                  x={hoveredX + tooltipPadding}
                  y={tooltipTop + tooltipValueOffset}
                >
                  {hoveredBucket.listeners.toLocaleString()}{' '}
                  {hoveredBucket.listeners === 1 ? 'listener' : 'listeners'}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}

function generateListenerUsageBuckets(
  points: ListenerUsagePoint[],
  generatedAt: string,
  window: string,
) {
  if (!generatedAt) {
    return [];
  }

  const end = floorListenerUsageDate(new Date(generatedAt), window);
  const start = getListenerUsageStart(end, window);
  const listenerCounts = new Map(
    points
      .filter((point) => point.window === window)
      .map((point) => [new Date(point.timestamp).getTime(), point.listeners]),
  );
  const buckets: ListenerUsageBucket[] = [];
  let timestamp = start;
  while (timestamp.getTime() <= end.getTime()) {
    buckets.push({
      listeners: listenerCounts.get(timestamp.getTime()) ?? 0,
      timestamp,
    });
    timestamp = incrementListenerUsageDate(timestamp, window);
  }

  return buckets;
}

function floorListenerUsageDate(date: Date, window: string) {
  if (window === 'hour') {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
      ),
    );
  }

  if (window === 'day') {
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

function getListenerUsageStart(end: Date, window: string) {
  if (window === 'hour') {
    return new Date(
      Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate(),
        end.getUTCHours(),
      ),
    );
  }

  if (window === 'day') {
    return new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );
  }

  if (window === 'week') {
    const start = new Date(end);
    const day = start.getUTCDay() || daysPerWeek;
    start.setUTCDate(start.getUTCDate() - day + 1);
    return start;
  }

  return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
}

function incrementListenerUsageDate(date: Date, window: string) {
  const next = new Date(date);
  if (window === 'hour') {
    next.setUTCMinutes(next.getUTCMinutes() + 1);
    return next;
  }
  if (window === 'day') {
    next.setUTCHours(next.getUTCHours() + 1);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function formatListenerUsageTick(date: Date, window: string) {
  if (window === 'hour') {
    return utcFormat('%H:%M')(date);
  }
  if (window === 'day') {
    return utcFormat('%H:00')(date);
  }

  return utcFormat('%d %b')(date);
}

function formatListenerUsagePoint(bucket: ListenerUsageBucket, window: string) {
  const timestamp = formatListenerUsageTimestamp(bucket.timestamp, window);
  const listenerLabel = bucket.listeners === 1 ? 'listener' : 'listeners';

  return `${timestamp}: ${bucket.listeners} ${listenerLabel}`;
}

function formatListenerUsageTimestamp(timestamp: Date, window: string) {
  if (window === 'hour') {
    return utcFormat('%d %b %H:%M UTC')(timestamp);
  }
  if (window === 'day') {
    return utcFormat('%d %b %H:00 UTC')(timestamp);
  }

  return utcFormat('%d %b %Y')(timestamp);
}

function getListenerUsageTooltipX(
  bucket: ListenerUsageBucket | null,
  xScale: (timestamp: Date) => number,
) {
  if (!bucket) {
    return chartLeft;
  }

  const centered = xScale(bucket.timestamp) - tooltipWidth / 2;
  return Math.min(Math.max(centered, chartLeft), chartRight - tooltipWidth);
}

const listenerUsageWindows = [
  { id: 'hour', label: 'Hour' },
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const chartWidth = 720;
const chartHeight = 320;
const chartLeft = 52;
const chartRight = 696;
const chartTop = 30;
const chartBottom = 270;
const chartTickCount = 4;
const chartAxisGap = 10;
const chartTickOffset = 4;
const chartLabelGap = 24;
const chartLineWidth = 4;
const pointRadius = 3;
const pointStrokeWidth = 2;
const tooltipWidth = 156;
const tooltipHeight = 48;
const tooltipTop = 34;
const tooltipRadius = 8;
const tooltipPadding = 10;
const tooltipTimestampOffset = 16;
const tooltipValueOffset = 35;
const minimumListenerDomain = 1;
const daysPerWeek = 7;
