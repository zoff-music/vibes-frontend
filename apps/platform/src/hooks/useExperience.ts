import { useLocation } from 'react-router';

export function useExperience() {
  const { pathname, search } = useLocation();

  if (pathname === '/' || pathname === '/features/music') {
    return 'MUSIC';
  }

  const watch =
    pathname === '/features/watch' ||
    pathname.startsWith('/discovery/watch') ||
    new URLSearchParams(search).get('type') === 'watch';

  return watch ? 'WATCH' : 'MUSIC';
}
