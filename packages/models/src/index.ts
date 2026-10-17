import { config } from 'zod/mini';
import en from 'zod/v4/locales/en.js';

// Mini omits the default locale; retain readable validation messages.
config(en());

export * from './limits';
export * from './schemas/admin';
export * from './schemas/authorization';
export * from './schemas/casting';
export * from './schemas/chat';
export * from './schemas/common';
export * from './schemas/config';
export * from './schemas/generate';
export * from './schemas/playback';
export * from './schemas/playlist';
export * from './schemas/remote';
export * from './schemas/room';
export * from './schemas/search';
export * from './schemas/session';
export * from './schemas/songs';
export * from './schemas/stats';
export * from './schemas/tv-player';
export * from './types/casting';
export type { RoomSnapshot } from './types/room-snapshot';
