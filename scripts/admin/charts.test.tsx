import { render } from 'preact-render-to-string';
import { describe, expect, it } from 'vitest';
import {
  type RoomUsageBucket,
  RoomUsageChart,
} from '../../packages/ui/src/web/graphs/RoomUsageChart';

const buckets: RoomUsageBucket[] = [
  {
    timestamp: new Date('2026-11-12T00:00:00Z'),
    total: 610,
    cached: 305,
    live: 305,
    rooms: Array.from({ length: 300 }, (_, index) => ({
      roomId: `room-${index}`,
      roomName: `Listening room ${index}`,
      roomType: 'MUSIC',
      value: 2,
      cached: 1,
      live: 1,
    })),
  },
];

describe('RoomUsageChart', () => {
  it.each([false, true])(
    'bounds a 300-room chart and preserves counts (cache split: %s)',
    (showCacheSplit) => {
      const html = render(
        <RoomUsageChart
          buckets={buckets}
          label="Messages"
          tickFormat="%H:%M"
          showCacheSplit={showCacheSplit}
        />,
      );
      const legend =
        html.match(/<ul[^>]*aria-label="Room legend"[^>]*>(.*?)<\/ul>/s)?.[1] ??
        '';
      expect(legend.match(/<li /g)).toHaveLength(7);
      expect(html).toContain('Other rooms (295)');
      expect(html).toContain('610 messages');
      expect(html).toContain('<circle');
      expect(html).toContain(
        showCacheSplit
          ? 'Uncached: 295, Cached: 295'
          : 'Other rooms (295): 590',
      );
      expect(html).toContain('Unattributed');
      expect(html).toContain('Page 1 of 15');
      expect(html.match(/aria-pressed="false"/g)).toHaveLength(20);
      expect(html).toContain('Listening room 0');
    },
  );

  it('handles an empty period', () => {
    const html = render(
      <RoomUsageChart buckets={[]} label="Messages" tickFormat="%H:%M" />,
    );
    expect(html).toContain('No activity in this period.');
    expect(html).not.toContain('NaN');
  });

  it('ranks audience by peak instead of cumulative samples', () => {
    const audience = [0, 1].map((index) => ({
      timestamp: new Date(2026, 0, 1, index),
      total: 16,
      rooms: [
        { roomId: 'steady', value: 6 },
        { roomId: 'spike', value: index === 0 ? 10 : 0 },
      ],
    }));
    const html = render(
      <RoomUsageChart
        buckets={audience}
        label="Participants"
        tickFormat="%H:%M"
        summaryMode="peak"
      />,
    );
    const legend =
      html.match(/<ul[^>]*aria-label="Room legend"[^>]*>(.*?)<\/ul>/s)?.[1] ??
      '';
    expect(legend.indexOf('spike')).toBeLessThan(legend.indexOf('steady'));
    expect(html).toContain('peak participants at sampled intervals');
  });
});
