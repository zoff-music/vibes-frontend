import { createHash } from 'node:crypto';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import postcss from 'postcss';
import presetEnv from 'postcss-preset-env';

const output = new URL('../dist/tizen/', import.meta.url);
const hash = (data) =>
  createHash('sha256').update(data).digest('hex').slice(0, 12);
const htmlPath = new URL('tizen.html', output);
let html = await readFile(htmlPath, 'utf8');
const entry = html.match(
  /<script type="module" crossorigin src="\.\/assets\/([^"]+)"><\/script>/,
);
if (!entry) throw new Error('Expected one Vite module entry in tizen.html');

// Tizen 6 serves packaged files without a MIME type and rejects module scripts.
const modulePath = new URL(`assets/${entry[1]}`, output);
const classic = await transform(await readFile(modulePath, 'utf8'), {
  target: 'chrome76',
  format: 'iife',
  minify: true,
  define: {
    'import.meta.url': '__zoffModuleUrl',
    'import.meta.resolve': 'undefined',
  },
  banner: 'var __zoffModuleUrl = document.currentScript.src;',
});
const classicName = `tizen-classic-${hash(classic.code)}.js`;
await writeFile(new URL(`assets/${classicName}`, output), classic.code);
await unlink(modulePath);

for (const match of html.matchAll(/href="\.\/assets\/([^"]+\.css)"/g)) {
  const cssPath = new URL(`assets/${match[1]}`, output);
  const result = await postcss([
    presetEnv({
      browsers: ['Chrome 76'],
      stage: 2,
      features: { 'custom-properties': false },
    }),
  ]).process(await readFile(cssPath, 'utf8'), {
    from: fileURLToPath(cssPath),
  });
  for (const warning of result.warnings()) console.warn(warning.toString());
  const name = `tizen-${hash(result.css)}.css`;
  await writeFile(new URL(`assets/${name}`, output), result.css);
  await unlink(cssPath);
  html = html.replaceAll(match[1], name);
}

const polyfills = await build({
  stdin: {
    contents: "import 'core-js/stable';",
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
  },
  bundle: true,
  write: false,
  minify: true,
  target: 'chrome76',
  format: 'iife',
});
const polyfillCode = polyfills.outputFiles[0].text;
const polyfillName = `polyfills-${hash(polyfillCode)}.js`;
await writeFile(new URL(`assets/${polyfillName}`, output), polyfillCode);
await writeFile(
  new URL('CORE-JS-LICENSE', output),
  await readFile(new URL('../node_modules/core-js/LICENSE', import.meta.url)),
);

html = html.replace(
  entry[0],
  `<script src="./assets/${polyfillName}"></script>\n<script defer src="./assets/${classicName}"></script>`,
);
html = html.replace(
  '<div id="root"></div>',
  '<div id="root"><p id="zoff-startup" role="status">Starting Zoff…</p></div>',
);
await writeFile(htmlPath, html);

console.log('Prepared classic scripts and legacy CSS for the TV.');
