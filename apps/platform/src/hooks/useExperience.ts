import { useLocation } from 'react-router';
import { watchNavigation } from '../seo/productNavigation';

export function useExperience() {
  const { pathname, search } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/features/music') {
    return 'MUSIC';
  }

  const watch =
    path === '/features/watch' ||
    watchNavigation.some((page) => path === `/discovery/${page.slug}`) ||
    new URLSearchParams(search).get('type') === 'watch';

  return watch ? 'WATCH' : 'MUSIC';
}
