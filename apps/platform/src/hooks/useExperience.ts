import { useLocation } from 'react-router';

export function useExperience() {
  const { pathname, search } = useLocation();
  const watch =
    pathname.startsWith('/discovery/watch') ||
    new URLSearchParams(search).get('type') === 'watch';

  return watch ? 'WATCH' : 'MUSIC';
}
