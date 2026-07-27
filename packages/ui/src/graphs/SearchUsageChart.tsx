import type { AdminSearchUsageSummary } from '@vibes/models';
import { max, scaleBand, scaleLinear } from 'd3';
import { type MouseEvent, useMemo, useState } from 'react';

interface SearchUsageChartProps {
  summaries: AdminSearchUsageSummary[];
}

interface SearchUsageBar {
  cached: number;
  live: number;
  provider: string;
  total: number;
}

export function SearchUsageChart({ summaries }: SearchUsageChartProps) {
  const [selectedWindow, setSelectedWindow] = useState('day');
  const [selectedProvider, setSelectedProvider] = useState(allProviders);
  const providers = useMemo(
    () =>
      Array.from(new Set(summaries.map((summary) => summary.provider))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [summaries],
  );
  const activeProvider =
    selectedProvider === allProviders || providers.includes(selectedProvider)
      ? selectedProvider
      : allProviders;
  const bars = useMemo<SearchUsageBar[]>(
    () =>
      summaries
        .filter(
          (summary) =>
            summary.window === selectedWindow &&
            (activeProvider === allProviders ||
              summary.provider === activeProvider),
        )
        .map((summary) => ({
          cached: summary.cached,
          live: summary.live,
          provider: summary.provider,
          total: summary.total,
        }))
        .sort((left, right) => left.provider.localeCompare(right.provider)),
    [activeProvider, selectedWindow, summaries],
  );
  const highestTotal = max(bars, (bar) => bar.total) ?? 0;
  const xScale = scaleBand<string>()
    .domain(bars.map((bar) => bar.provider))
    .range([chartLeft, chartRight])
    .padding(chartBarPadding);
  const yScale = scaleLinear()
    .domain([0, Math.max(highestTotal, 1)])
    .nice()
    .range([chartBottom, chartTop]);
  const ticks = yScale.ticks(chartTickCount);

  const handleWindowChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedWindow(event.currentTarget.value);
  };

  const handleProviderChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedProvider(event.currentTarget.value);
  };

  return (
    <div className="glass mb-4 rounded-2xl border-2 border-ink/10 p-5 dark:border-gray-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-lg">Provider search distribution</h3>
          <p className="text-ink/50 text-xs dark:text-gray-500">
            Cached and live searches for the selected calendar window.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {searchUsageWindows.map((window) => (
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

      <fieldset className="mt-4 flex flex-wrap gap-2">
        <legend className="sr-only">Search provider</legend>
        <button
          aria-pressed={activeProvider === allProviders}
          className={
            activeProvider === allProviders
              ? 'rounded-lg bg-secondary px-3 py-2 font-bold text-white text-xs'
              : 'rounded-lg bg-ink/5 px-3 py-2 font-bold text-ink/60 text-xs transition-colors hover:bg-ink/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }
          onClick={handleProviderChange}
          type="button"
          value={allProviders}
        >
          All providers
        </button>
        {providers.map((provider) => (
          <button
            aria-pressed={activeProvider === provider}
            className={
              activeProvider === provider
                ? 'rounded-lg bg-secondary px-3 py-2 font-bold text-white text-xs'
                : 'rounded-lg bg-ink/5 px-3 py-2 font-bold text-ink/60 text-xs transition-colors hover:bg-ink/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }
            key={provider}
            onClick={handleProviderChange}
            type="button"
            value={provider}
          >
            {providerLabels[provider] ?? provider}
          </button>
        ))}
      </fieldset>

      <div className="mt-4 flex items-center gap-4 text-ink/60 text-xs dark:text-gray-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
          Cached
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Live
        </span>
      </div>

      {bars.length === 0 && (
        <p className="py-16 text-center text-ink/50 text-sm dark:text-gray-500">
          No searches recorded for this window.
        </p>
      )}

      {bars.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <svg
            aria-label={`Cached and live ${activeProvider === allProviders ? 'provider' : activeProvider} searches for ${selectedWindow}`}
            className="w-full min-w-xl"
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {ticks.map((tick) => (
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
            {bars.map((bar) => {
              const x = xScale(bar.provider) ?? chartLeft;
              const width = xScale.bandwidth();
              const cachedTop = yScale(bar.cached);
              const totalTop = yScale(bar.cached + bar.live);

              return (
                <g key={bar.provider}>
                  <rect
                    className="fill-cyan-400"
                    height={chartBottom - cachedTop}
                    rx={chartBarRadius}
                    width={width}
                    x={x}
                    y={cachedTop}
                  />
                  <rect
                    className="fill-primary"
                    height={cachedTop - totalTop}
                    rx={chartBarRadius}
                    width={width}
                    x={x}
                    y={totalTop}
                  />
                  <text
                    className="fill-ink font-bold text-sm dark:fill-white"
                    textAnchor="middle"
                    x={x + width / 2}
                    y={Math.max(totalTop - chartValueGap, chartTop)}
                  >
                    {bar.total}
                  </text>
                  <text
                    className="fill-ink/60 text-xs capitalize dark:fill-gray-400"
                    textAnchor="middle"
                    x={x + width / 2}
                    y={chartBottom + chartLabelGap}
                  >
                    {bar.provider}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

const searchUsageWindows = [
  { id: 'hour', label: 'Hour' },
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const providerLabels: Record<string, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const allProviders = 'all';

const chartWidth = 720;
const chartHeight = 320;
const chartLeft = 52;
const chartRight = 696;
const chartTop = 30;
const chartBottom = 270;
const chartTickCount = 4;
const chartBarPadding = 0.35;
const chartAxisGap = 10;
const chartTickOffset = 4;
const chartBarRadius = 6;
const chartValueGap = 8;
const chartLabelGap = 24;
