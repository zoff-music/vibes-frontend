import type { LoaderFunctionArgs } from 'react-router';
import { getPublicContactEmails } from '../../config.server';

export interface SecurityLoaderData {
  securityEmail: string;
}

export async function securityLoader(
  _args: LoaderFunctionArgs,
): Promise<SecurityLoaderData> {
  const emails = getPublicContactEmails();
  if (!emails.security) {
    throw new Error('SECURITY_EMAIL is required');
  }

  return { securityEmail: emails.security };
}

export type SecurityData = Awaited<ReturnType<typeof securityLoader>>;
