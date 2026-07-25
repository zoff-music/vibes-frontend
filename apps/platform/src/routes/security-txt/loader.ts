import type { LoaderFunctionArgs } from 'react-router';
import {
  getPublicContactEmails,
  getSecurityPolicyExpires,
} from '../../config.server';

export async function loader(_args: LoaderFunctionArgs): Promise<Response> {
  const emails = getPublicContactEmails();
  const expires = getSecurityPolicyExpires();
  if (!emails.security) {
    throw new Error('SECURITY_EMAIL is required');
  }
  if (!expires) {
    throw new Error('SECURITY_POLICY_EXPIRES is required');
  }

  const body = [
    `Contact: mailto:${emails.security}`,
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    'Canonical: https://zoff.me/.well-known/security.txt',
    'Policy: https://zoff.me/security',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
