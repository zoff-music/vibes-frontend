import { isRouteErrorResponse } from 'react-router';

export function getPublicRouteErrorMessage(error: unknown): string {
  if (!isRouteErrorResponse(error)) {
    return 'Something went wrong. Reload the page or return to pairing.';
  }
  if (error.status === 401 || error.status === 403) {
    return 'This remote session is not authorized. Pair the remote again.';
  }
  if (error.status === 404 || error.status === 410) {
    return 'This remote is no longer available. Pair another machine.';
  }
  if (error.status === 429) {
    return 'Too many requests. Wait a moment, then try again.';
  }
  return 'The remote request could not be completed. Please try again.';
}
