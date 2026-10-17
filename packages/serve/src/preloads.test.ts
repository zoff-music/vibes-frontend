import assert from 'node:assert/strict';
import { once } from 'node:events';
import { get } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import express from 'express';
import { documentPreloads } from './assets.ts';
import { sendDocumentPreloads, staticDocumentPreloads } from './preloads.ts';

test('document hints retain hashed URLs, app bases and resource CORS modes', () => {
  for (const base of [
    '/',
    '/admin/',
    '/remotes/',
    '/embed/',
    'https://assets.example/embed/',
  ]) {
    const css = `${base}assets/index-hash.css`;
    const font = `${base}assets/font-hash.woff2`;
    const links = documentPreloads(css, [font]);

    assert.deepEqual(links, [
      `<${font}>; rel=preload; as=font; type="font/woff2"; crossorigin`,
      `<${css}>; rel=preload; as=style`,
    ]);
  }
});

test('static Cast document hints match generated stylesheets and fonts, not scripts', () => {
  const html = `<head>
    <link rel="preload" href="https://cdn.example/receiver/font.woff2" as="font" crossorigin="anonymous">
    <link crossorigin rel="stylesheet" href="https://cdn.example/receiver/index.css">
    <link href="/not-critical.js" rel="modulepreload">
    <link rel="icon" href="/favicon.png">
    <link rel="stylesheet" crossorigin href="https://cdn.example/receiver/index.css">
  </head><body><link rel="stylesheet" href="/optional.css"></body>`;

  assert.deepEqual(staticDocumentPreloads(html), [
    '<https://cdn.example/receiver/font.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
    '<https://cdn.example/receiver/index.css>; rel=preload; as=style; crossorigin',
  ]);
});

test('103 precedes loader completion and final Link retains route hints', async (t) => {
  const app = express();
  const links = documentPreloads('/assets/root.css', ['/assets/regular.woff2']);
  let release: (() => void) | undefined;
  const loader = new Promise<void>((resolve) => {
    release = resolve;
  });

  app.get('/', async (req, res) => {
    res.set('Link', `</route.js>; rel=modulepreload, ${links.join(', ')}`);
    sendDocumentPreloads(req, res, [...links, links[0] ?? '']);
    await loader;
    res.type('html').send('<html></html>');
  });

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
  const request = get(url, { headers: { Accept: 'text/html' } });
  const completed = once(request, 'response');
  const [information] = await once(request, 'information');

  assert.equal(information.statusCode, 103);
  assert.equal(information.headers.link, links.join(', '));
  release?.();

  const [response] = await completed;
  assert.equal(
    response.headers.link,
    `</route.js>; rel=modulepreload, ${links.join(', ')}`,
  );
  response.resume();
});

test('non-document requests and mutations never receive speculative hints', async (t) => {
  const app = express();
  app.use((req, res) => {
    sendDocumentPreloads(
      req,
      res,
      documentPreloads('/root.css', ['/font.woff2']),
    );
    res.send('ok');
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;

  for (const [method, accept] of [
    ['GET', 'application/json'],
    ['HEAD', 'text/html'],
    ['POST', 'text/html'],
  ]) {
    const response = await fetch(url, {
      method,
      headers: { Accept: accept ?? '' },
    });
    assert.equal(response.headers.get('link'), null);
  }

  for (const path of [
    '_smolter',
    'admin/_smolter',
    'remotes/_smolter',
    'embed/_smolter',
    'resources/profiles',
    'api/v3/rooms',
    'robots.txt',
    'sitemap.xml',
    '.well-known/security.txt',
  ]) {
    const response = await fetch(`${url}${path}`, {
      headers: { Accept: 'text/html' },
    });

    assert.equal(response.headers.get('link'), null, path);
  }
});
