import type { LoaderFunctionArgs } from 'react-router';
import { loader as homeLoader } from '../_index/loader';

export function loader(args: LoaderFunctionArgs) {
  const { experience } = args.params;

  if (experience !== 'music' && experience !== 'watch') {
    throw new Response('Not found', { status: 404 });
  }

  return homeLoader(args);
}
