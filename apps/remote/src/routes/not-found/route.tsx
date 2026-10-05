import { NotFoundView } from '@vibes/ui/web';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: 'Page Not Found | Zoff' },
  { name: 'robots', content: 'noindex, nofollow' },
];

export default function NotFound() {
  return <NotFoundView />;
}
