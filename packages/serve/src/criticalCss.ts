import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';
import { type CompactPlan, createProcessor } from 'beasties/runtime';
import Negotiator from 'negotiator';

const compressBrotli = promisify(brotliCompress);
// Buffered documents can afford denser Brotli than streamed responses: quality 10 keeps
// room pages in the first round trip for ~15 ms of thread-pool time, off the event loop.
const documentQuality = 10;

const placeholder = '<style id="critical-css"></style>';
const deferredMarker = 'data-critical="defer"';
// Deferred regions have no inline styles; keep them hidden until the full stylesheet reveals them.
const hideDeferred = '[data-critical="defer"]{visibility:hidden}';
const autofocus = /<[a-z][^>]*\sautofocus[\s=/>]/;
const variableReference = /var\(\s*(--[\w-]+)/g;
const customDeclaration = /([{;])(--[\w-]+):([^;}]*)(?=[;}])/g;
const registeredProperty = /@property (--[\w-]+)\{[^}]*\}/g;
const emptyRule = /(^|[{}])[^{}@;]+\{\}/g;
const emptyAtRule = /@[^{};]+\{\}/g;

interface CriticalCssBuild {
  layers: string;
  plans: CompactPlan[];
  /** The same sheets with focus states, for documents that autofocus a control. */
  focusPlans: CompactPlan[];
}

interface CriticalCssOptions {
  enabled: boolean;
  /** Directory holding the client build, relative to the working directory. */
  clientDir?: string;
}

/** Build output written by `criticalCss()` from `@vibes/serve/critical-css/vite`. */
export const criticalCssPlanFile = '.vite/critical-css.json';

async function loadProcessor(path: string) {
  const source = await readFile(path, 'utf8');
  const { layers, plans, focusPlans }: CriticalCssBuild = JSON.parse(source);
  const options = { inlineFonts: true, preloadFonts: false };

  return {
    layers,
    processor: createProcessor(plans, options),
    focusProcessor: createProcessor(focusPlans, options),
  };
}

// Blocks the first paint never needs:
// - `@layer properties` only backfills `@property` defaults for browsers older than Safari 16.4 / Firefox 128.
// - `prefers-color-scheme` mirrors `.dark`, which the theme script sets before paint.
const redundantBlocks = [
  '@layer properties{',
  '@media (prefers-color-scheme:dark){',
];

function removeBlocks(css: string, prefix: string) {
  let result = css;
  let start = result.indexOf(prefix);
  while (start !== -1) {
    let depth = 0;
    let end = result.indexOf('{', start);
    for (; end !== -1 && end < result.length; end++) {
      if (result[end] === '{') depth++;
      if (result[end] === '}' && --depth === 0) break;
    }
    if (end === -1) break;
    result = result.slice(0, start) + result.slice(end + 1);
    start = result.indexOf(prefix, start);
  }

  return result;
}

function references(source: string, used: Set<string>) {
  for (const [, name] of source.matchAll(variableReference)) {
    if (name) used.add(name);
  }
}

// Regions marked `data-critical="defer"` sit below the fold; their styles arrive with the full sheet.
function withoutDeferred(html: string) {
  const marker = /<([a-z][a-z0-9-]*)\b[^>]*\sdata-critical="defer"[^>]*>/g;
  let result = html;
  let match = marker.exec(result);
  while (match) {
    const tag = match[1];
    // A fixed pattern for every tag; only the deferred element's own tag changes depth.
    const tags = /<(\/?)([a-z][a-z0-9-]*)\b[^>]*>/g;
    tags.lastIndex = match.index + match[0].length;
    let depth = 1;
    let end = result.length;
    for (let next = tags.exec(result); next; next = tags.exec(result)) {
      if (next[2] !== tag) continue;
      depth += next[1] ? -1 : 1;
      if (depth === 0) {
        end = next.index + next[0].length;
        break;
      }
    }
    result = result.slice(0, match.index) + result.slice(end);
    marker.lastIndex = match.index;
    match = marker.exec(result);
  }

  return result;
}

// The theme script adds `.dark` before paint, so automatic documents need both palettes.
function themedDocument(html: string) {
  return html.replace(/<html([^>]*?) class="([^"]*)"/, (match, attrs, value) =>
    /(?:^|\s)theme-light(?:\s|$)/.test(value)
      ? match
      : `<html${attrs} class="dark ${value}"`,
  );
}

// Tailwind emits the whole theme and every registered property; keep what this document reaches.
// Inline font faces drop `unicode-range`: the same file is used and missing glyphs still fall back.
function compactCriticalCss(source: string, html: string) {
  const css = redundantBlocks.reduce(removeBlocks, source);
  const used = new Set<string>();
  references(html, used);
  references(css.replace(customDeclaration, '$1'), used);
  for (const [block] of css.matchAll(
    /@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*\}/g,
  )) {
    for (const [, name] of block.matchAll(/(--[\w-]+):/g)) {
      if (name) used.add(name);
    }
  }

  const declarations = [...css.matchAll(customDeclaration)];
  let size = -1;
  while (size !== used.size) {
    size = used.size;
    for (const [, , name, value] of declarations) {
      if (name && used.has(name)) references(value ?? '', used);
    }
  }

  let pruned = css
    .replace(registeredProperty, (rule, name) => (used.has(name) ? rule : ''))
    .replace(customDeclaration, (declaration, prefix, name) =>
      used.has(name) ? declaration : prefix,
    )
    .replace(/;unicode-range:[^;}]*/g, '')
    .replace(/([{;]);+/g, '$1')
    .replaceAll(';}', '}');
  let previous = '';
  while (previous !== pruned) {
    previous = pruned;
    pruned = pruned.replace(emptyRule, '$1').replace(emptyAtRule, '');
  }

  return pruned;
}

// The stylesheet stays non-blocking only when its inline subset was written.
function activateStylesheet(html: string) {
  return html.replace(/<link\b[^>]*\bdata-critical-stylesheet\b[^>]*>/, (tag) =>
    tag.replace('media="print"', 'media="all"'),
  );
}

export function createCriticalCss({
  enabled,
  clientDir = 'dist/client',
}: CriticalCssOptions) {
  const processor = enabled
    ? loadProcessor(resolve(clientDir, criticalCssPlanFile))
    : undefined;

  return async function inlineCriticalCss(
    response: Response,
    request?: Request,
    /** Module preloads the document carries as markup instead of on the final Link header. */
    modulePreloads: string[] = [],
  ) {
    if (
      !processor ||
      !response.headers.get('content-type')?.includes('text/html')
    ) {
      return response;
    }

    // Critical CSS needs the whole document before the head can be sent.
    const html = await response.text();
    const started = performance.now();
    const [loadError, loaded] = await safeWrapAsync(processor);
    const [error, css] = safeWrap(() => {
      if (!loaded) throw loadError ?? new Error('Critical CSS is unavailable');
      const processor = autofocus.test(html)
        ? loaded.focusProcessor
        : loaded.processor;
      const { css } = processor.extract(themedDocument(withoutDeferred(html)));
      const hidden = html.includes(deferredMarker) ? hideDeferred : '';
      return loaded.layers + hidden + compactCriticalCss(css, html);
    });
    if (error) console.error('Unable to inline critical CSS', error);

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.append(
      'Server-Timing',
      `critical-css;dur=${(performance.now() - started).toFixed(2)}`,
    );

    const styled = css
      ? html.replace(
          placeholder,
          () => `<style id="critical-css">${css}</style>`,
        )
      : activateStylesheet(html);
    const preloadMarkup = modulePreloads
      .map((href) => `<link rel="modulepreload" href="${href}"/>`)
      .join('');
    const document = preloadMarkup
      ? styled.replace('</head>', () => `${preloadMarkup}</head>`)
      : styled;

    const init = {
      status: response.status,
      statusText: response.statusText,
      headers,
    };
    if (!acceptsBrotli(request)) return new Response(document, init);

    const source = Buffer.from(document);
    const [compressError, body] = await safeWrapAsync(
      compressBrotli(source, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: documentQuality,
          [constants.BROTLI_PARAM_SIZE_HINT]: source.length,
        },
      }),
    );
    if (compressError || !body) return new Response(document, init);

    // The compression middleware leaves responses that are already encoded untouched.
    headers.set('Content-Encoding', 'br');
    headers.set('Content-Length', String(body.length));
    headers.append('Vary', 'Accept-Encoding');
    return new Response(new Uint8Array(body), init);
  };
}

function acceptsBrotli(request?: Request) {
  const accept = request?.headers.get('accept-encoding');
  if (!accept) return false;

  return (
    new Negotiator({ headers: { 'accept-encoding': accept } }).encoding([
      'br',
      'identity',
    ]) === 'br'
  );
}
