import { isRouteErrorResponse } from '@kasperrt/smolter/preact';

interface PublicRoomError {
  isRoomNotFound: boolean;
  message: string;
}

export function normalizeRouteError(routeError: unknown): PublicRoomError {
  if (isRouteErrorResponse(routeError)) {
    if (routeError.status === 404) {
      return {
        isRoomNotFound: true,
        message: 'This room could not be found.',
      };
    }

    if (routeError.status === 429) {
      return {
        isRoomNotFound: false,
        message: 'Too many requests. Wait a moment, then try again.',
      };
    }
  }

  return {
    isRoomNotFound: false,
    message: 'Could not load this room. Please try again.',
  };
}
