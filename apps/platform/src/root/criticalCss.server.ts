import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { safeWrapAsync } from '@vibes/shared/wrap';
import { type CompactPlan, createProcessor } from 'beasties/runtime';

async function loadProcessor() {
  const source = await readFile(
    resolve('dist/client/.vite/critical-css.json'),
    'utf8',
  );
  const plans: CompactPlan[] = JSON.parse(source);

  return createProcessor(plans, {
    inlineFonts: true,
    preloadFonts: false,
    cache: false,
  });
}

const processor =
  process.env.CRITICAL_CSS === 'true' ? loadProcessor() : undefined;

export async function inlineCriticalCss(response: Response) {
  if (
    !processor ||
    !response.headers.get('content-type')?.includes('text/html')
  ) {
    return response;
  }

  // Draft experiment: buffering sacrifices streaming; measure before enabling.
  const html = await response.text();
  const started = performance.now();
  const [error, result] = await safeWrapAsync(
    processor.then((value) => value.extract(html)),
  );
  if (error) console.error('Unable to inline critical CSS', error);

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.append(
    'Server-Timing',
    `critical-css;dur=${(performance.now() - started).toFixed(2)}`,
  );

  const document = result
    ? html.replace(
        '<style id="critical-css"></style>',
        () => `<style id="critical-css">${result.css}</style>`,
      )
    : html.replaceAll('media="print"', 'media="all"');

  return new Response(document, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
