import type {
  AddPlaylistRequest,
  AddPlaylistResponse,
  AddSongRequest,
  AddSongResponse,
  MusicPlaylist,
  SearchResult,
  YouTubeVideo,
} from '@vibes/models';
import { useMemo } from 'react';
import type { ApiClient, ApiResult } from '../index';

export interface ProviderRequests {
  addPlaylist: (
    roomId: string,
    playlist: AddPlaylistRequest,
  ) => ApiResult<AddPlaylistResponse>;
  addSong: (roomId: string, song: AddSongRequest) => ApiResult<AddSongResponse>;
  fetchSoundCloudPlaylist: (url: string) => ApiResult<MusicPlaylist>;
  fetchSoundCloudTrack: (url: string) => ApiResult<SearchResult>;
  fetchSpotifyPlaylist: (id: string) => ApiResult<MusicPlaylist>;
  fetchSpotifyTrack: (id: string) => ApiResult<SearchResult>;
  fetchYouTubePlaylist: (id: string) => ApiResult<MusicPlaylist>;
  fetchYouTubeTrack: (id: string) => ApiResult<YouTubeVideo>;
  searchSoundCloud: (query: string) => ApiResult<SearchResult[]>;
  searchSpotify: (query: string) => ApiResult<SearchResult[]>;
  searchYouTube: (query: string) => ApiResult<YouTubeVideo[] | undefined>;
}

export function useProviderRequests(client: ApiClient): ProviderRequests {
  return useMemo(
    () => ({
      addPlaylist: (roomId: string, playlist: AddPlaylistRequest) =>
        client.post('/rooms/{id}/playlists', { id: roomId }, playlist),
      addSong: (roomId: string, song: AddSongRequest) =>
        client.post('/rooms/{id}/songs', { id: roomId }, song),
      fetchSoundCloudPlaylist: (url: string) =>
        client.get('/soundcloud/playlists', { $search: { url } }),
      fetchSoundCloudTrack: (url: string) =>
        client.get('/soundcloud/tracks', { $search: { url } }),
      fetchSpotifyPlaylist: (id: string) =>
        client.get('/spotify/playlists/{id}', { id }),
      fetchSpotifyTrack: (id: string) =>
        client.get('/spotify/tracks/{id}', { id }),
      fetchYouTubePlaylist: (id: string) =>
        client.get('/youtube/playlists/{id}', { id }),
      fetchYouTubeTrack: (id: string) =>
        client.get('/youtube/videos/{id}', { id }),
      searchSoundCloud: (query: string) =>
        client.get('/soundcloud/search', { $search: { q: query } }),
      searchSpotify: (query: string) =>
        client.get('/spotify/search', { $search: { q: query } }),
      searchYouTube: (query: string) =>
        client.get('/youtube/search', { $search: { q: query } }),
    }),
    [client],
  );
}
