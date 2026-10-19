import {
  type ClientActionFunctionArgs,
  readSubmission,
} from '@kasperrt/smolter/preact';
import { api } from '@vibes/api';
import type {
  AddPlaylistItemRequest,
  AddPlaylistItemResponse,
  AddPlaylistRequestV2,
  AddPlaylistResponse,
  CastingTokenResponse,
  PlaybackStateV2,
  ProviderItem,
  ProviderPlaylist,
  ProviderSearchResponse,
  RoomGenerationUpdate,
  RoomUpdateV2,
  RoomV2,
  SessionResponseV2,
  SkipPlaylistItemResponse,
} from '@vibes/models';
import { createErrorData } from '../../../../utils/room-actions/error';

export type RoomActionIntent =
  | 'sendMessage'
  | 'addPlaylist'
  | 'addPlaylistItem'
  | 'castingToken'
  | 'generatePlaylist'
  | 'joinRoom'
  | 'playback'
  | 'providerPlaylist'
  | 'providerItem'
  | 'removePlaylistItem'
  | 'resetPlayback'
  | 'search'
  | 'skip'
  | 'updateRoom'
  | 'votePlaylistItem';

export interface RoomActionData {
  addPlaylist?: AddPlaylistResponse;
  addPlaylistItem?: AddPlaylistItemResponse;
  casting?: {
    roomId: string;
    token: CastingTokenResponse;
  };
  error?: string;
  errorAction?: 'adminLogin';
  intent: RoomActionIntent;
  generation?: RoomGenerationUpdate;
  playback?: PlaybackStateV2;
  playlist?: ProviderPlaylist;
  provider?: 'soundcloud' | 'youtube';
  room?: RoomV2;
  searchResults?: ProviderSearchResponse;
  session?: SessionResponseV2;
  skip?: SkipPlaylistItemResponse;
  item?: ProviderItem;
}

export interface RoomActionRequest {
  text?: string;
  action?: 'pause' | 'play' | 'seek';
  force?: boolean;
  intent: RoomActionIntent;
  password?: string;
  positionMs?: number;
  prompt?: string;
  provider?: 'soundcloud' | 'youtube';
  room?: RoomUpdateV2;
  playlistItem?: AddPlaylistItemRequest;
  playlistItemId?: string;
  sourceId?: string;
  providerUrl?: string;
  playlist?: AddPlaylistRequestV2;
}

export async function clientAction({
  request,
  params,
}: ClientActionFunctionArgs): Promise<RoomActionData> {
  const roomId = params.id;

  if (!roomId) {
    return {
      error: 'Room ID is required',
      intent: 'joinRoom',
    };
  }

  const body = (await readSubmission(request)) as RoomActionRequest;

  if (
    body.intent === 'generatePlaylist' ||
    body.intent === 'addPlaylist' ||
    body.intent === 'providerItem' ||
    body.intent === 'providerPlaylist' ||
    body.intent === 'search'
  ) {
    const { playlistAction } = await preloadPlaylistAction();

    return playlistAction(roomId, body, request.signal);
  }

  if (body.intent === 'sendMessage') {
    const [error] = await api.post(
      '/rooms/{id}/messages',
      { id: roomId },
      { text: body.text ?? '' },
      { retry: 0 },
    );

    if (error) return createErrorData(body.intent, error);

    return { intent: body.intent };
  }

  if (body.intent === 'joinRoom') {
    const [error, session] = await api.v2.post(
      '/rooms/{id}/sessions',
      { id: roomId },
      { password: body.password },
    );

    if (error || !session) {
      return createErrorData(body.intent, error);
    }

    return {
      intent: body.intent,
      room: session.room,
      session,
    };
  }

  if (body.intent === 'castingToken') {
    const [error, castingToken] = await api.post('/tokens/casting', null, {
      roomId,
    });

    if (error || !castingToken) {
      return createErrorData(body.intent, error);
    }

    return {
      casting: { roomId, token: castingToken },
      intent: body.intent,
    };
  }

  if (body.intent === 'updateRoom') {
    const [error, room] = await api.v2.patch(
      '/rooms/{id}/settings',
      { id: roomId },
      body.room ?? {},
    );

    if (error || !room) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, room };
  }

  if (body.intent === 'playback') {
    if (!body.action) {
      return { error: 'Playback action is required', intent: body.intent };
    }

    const [error, playback] = await api.v2.put(
      '/rooms/{id}/states',
      { id: roomId },
      { action: body.action, positionMs: body.positionMs },
    );

    if (error || !playback) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, playback };
  }

  if (body.intent === 'resetPlayback') {
    const [error, playback] = await api.v2.get('/rooms/{id}/states', {
      id: roomId,
    });

    if (error || !playback) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, playback };
  }

  if (body.intent === 'skip') {
    const [error, skip] = await api.v2.post(
      '/rooms/{id}/skips',
      { id: roomId },
      {},
    );

    if (error || !skip) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent, playback: skip.playback, skip };
  }

  if (body.intent === 'addPlaylistItem') {
    if (!body.playlistItem) {
      return { error: 'Song is required', intent: body.intent };
    }

    const [error, addPlaylistItem] = await api.v3.post(
      '/rooms/{id}/items',
      { id: roomId },
      body.playlistItem,
    );

    if (error || !addPlaylistItem) {
      return createErrorData(body.intent, error);
    }

    return { addPlaylistItem, intent: body.intent };
  }

  if (body.intent === 'removePlaylistItem') {
    if (!body.playlistItemId) {
      return { error: 'Song ID is required', intent: body.intent };
    }

    const [error] = await api.v3.delete('/rooms/{id}/items/{itemId}', {
      id: roomId,
      itemId: body.playlistItemId,
    });

    if (error) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent };
  }

  if (body.intent === 'votePlaylistItem') {
    if (!body.playlistItemId) {
      return { error: 'Song ID is required', intent: body.intent };
    }

    const [error] = await api.v3.post(
      '/rooms/{id}/items/{itemId}',
      { id: roomId, itemId: body.playlistItemId },
      {},
    );

    if (error) {
      return createErrorData(body.intent, error);
    }

    return { intent: body.intent };
  }

  return { error: 'Unsupported room action', intent: body.intent };
}

export function preloadPlaylistAction() {
  return import('./playlist/clientAction');
}
