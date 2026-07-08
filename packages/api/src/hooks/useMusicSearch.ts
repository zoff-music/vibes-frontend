import type { SourceType } from '@vibes/shared';
import { useCallback } from 'react';
import { api } from '../index';

export interface SearchApiResult {
  id: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl: string;
  duration?: string;
  url?: string;
  source?: string;
}

export interface YouTubeVideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: string;
}

export function useMusicSearch() {
  const searchProvider = useCallback(
    async (
      provider: SourceType,
      query: string,
    ): Promise<[Error | null, SearchApiResult[] | null]> => {
      if (provider === 'youtube') {
        const [err, results] = await api.get('/youtube/search', {
          $search: { q: query },
        });
        return [err, results as SearchApiResult[] | null];
      }

      if (provider === 'spotify') {
        const [err, results] = await api.get('/spotify/search', {
          $search: { q: query },
        });
        return [err, results as SearchApiResult[] | null];
      }

      const [err, results] = await api.get('/soundcloud/search', {
        $search: { q: query },
      });
      return [err, results as SearchApiResult[] | null];
    },
    [],
  );

  const getYouTubeVideo = useCallback(
    async (id: string): Promise<[Error | null, YouTubeVideoResult | null]> => {
      const [err, video] = await api.get('/youtube/videos/{id}', { id });
      return [err, video as YouTubeVideoResult | null];
    },
    [],
  );

  return { searchProvider, getYouTubeVideo };
}
