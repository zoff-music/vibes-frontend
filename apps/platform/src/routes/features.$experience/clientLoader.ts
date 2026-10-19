import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { clientLoader as homeClientLoader } from '../_index/clientLoader';

export function clientLoader(args: ClientLoaderFunctionArgs) {
  const { experience } = args.params;

  if (experience !== 'music' && experience !== 'watch') {
    throw new Response('Not found', { status: 404 });
  }

  return homeClientLoader(args);
}
