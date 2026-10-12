// A TV-local document gives the official YouTube iframe an HTTP referrer.
// No media is proxied; only this small HTML wrapper is served.
var http = require('http');
var url = require('url');
var server;
function createPlayerServer() {
  return http.createServer((request, response) => {
    var parsed = url.parse(request.url, true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405);
      response.end('Method not allowed');
      return;
    }
    if (parsed.pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('Zoff player ready');
      return;
    }
    var id = parsed.query.video;
    if (
      parsed.pathname !== '/youtube' ||
      typeof id !== 'string' ||
      !/^[a-zA-Z0-9_-]{11}$/.test(id)
    ) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    var seconds = Math.max(
      0,
      Math.min(86400, parseInt(parsed.query.start, 10) || 0),
    );
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    response.end(
      '<!doctype html><html><head><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zoff YouTube Player</title><style>html,body,iframe{width:100%;height:100%;margin:0;border:0;overflow:hidden;background:#000}iframe{display:block}</style></head><body><iframe title="YouTube player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen src="https://www.youtube.com/embed/' +
        id +
        '?autoplay=1&amp;controls=1&amp;playsinline=1&amp;rel=0&amp;start=' +
        seconds +
        '"></iframe></body></html>',
    );
  });
}
module.exports.onStart = () => {
  if (server) return;
  server = createPlayerServer();
  server.listen(34771, '127.0.0.1');
};
module.exports.onStop = () => {
  if (server) server.close();
  server = undefined;
};
module.exports.onRequest = () => {};
module.exports.createPlayerServer = createPlayerServer;
