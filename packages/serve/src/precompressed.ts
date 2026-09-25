import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';
import type { RequestHandler } from 'express';
import Negotiator from 'negotiator';

export async function precompressedAssets(
  root: string,
): Promise<RequestHandler> {
  const [error, files] = await safeWrapAsync(
    readdir(root, { recursive: true }),
  );
  if (error) throw error;

  const available = new Set(files);

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const [decodeError, decoded] = safeWrap(() => decodeURIComponent(req.path));
    if (decodeError || decoded === null) return next();

    const filename = decoded.replace(/^\//, '');
    // Only exact names inventoried inside the asset directory are served.
    if (!available.has(filename)) return next();

    res.vary('Accept-Encoding');
    const encodings: string[] = [];
    if (available.has(`${filename}.br`)) encodings.push('br');
    if (available.has(`${filename}.gz`)) encodings.push('gzip');
    encodings.push('identity');

    // Negotiator 1 supports server preference for equal q-values; its older
    // DefinitelyTyped declarations do not yet expose the options argument.
    const negotiator = new Negotiator(req) as Negotiator & {
      encoding(
        available: string[],
        options: { preferred: string[] },
      ): string | undefined;
    };
    const encoding = negotiator.encoding(encodings, {
      preferred: ['br', 'gzip', 'identity'],
    });
    if (!encoding) {
      res.sendStatus(406);
      return;
    }
    if (encoding === 'identity') return next();

    const extension = encoding === 'br' ? 'br' : 'gz';
    res.type(path.extname(filename));
    res.set('Content-Encoding', encoding);
    res.sendFile(
      `${filename}.${extension}`,
      { root, immutable: true, maxAge: '1y', acceptRanges: false },
      (sendError) => {
        if (sendError) next(sendError);
      },
    );
  };
}
