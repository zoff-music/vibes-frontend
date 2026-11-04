import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  if (new URL(request.url).pathname.endsWith('/settings/device')) {
    await import('../../components/DeviceSettings');
  }

  return {};
}
