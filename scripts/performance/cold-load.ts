import { safeWrapAsync } from '@vibes/shared/wrap';
import { type Browser, chromium, type Request } from 'playwright';

interface Viewport {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

interface Resource {
  url: string;
  type: string;
  firstParty: boolean;
  status: number;
  encodedBodyBytes: number;
  transferBytes: number;
  durationMs: number;
}

interface Failure {
  url: string;
  reason: string;
}

interface Metric {
  name: string;
  value: number;
}

interface Metrics {
  metrics: Metric[];
}

interface Totals {
  requests: number;
  encodedBodyBytes: number;
  transferBytes: number;
}

const viewports: Viewport[] = [
  {
    name: 'mobile',
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
  },
  {
    name: 'desktop',
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
  },
];
const sampleDurationMs = 3000;
const repetitions = 3;

function publicUrl(value: string) {
  const url = new URL(value);
  return `${url.origin}${url.pathname}`;
}

async function measureResource(request: Request, origin: string) {
  const response = await request.response();
  const sizes = await request.sizes();
  const timing = request.timing();
  const resource: Resource = {
    url: publicUrl(request.url()),
    type: request.resourceType(),
    firstParty: new URL(request.url()).origin === origin,
    status: response?.status() ?? 0,
    encodedBodyBytes: sizes.responseBodySize,
    transferBytes: sizes.responseBodySize + sizes.responseHeadersSize,
    durationMs: timing.responseEnd,
  };
  return resource;
}

function totals(resources: Resource[]): Totals {
  return resources.reduce<Totals>(
    (sum, resource) => ({
      requests: sum.requests + 1,
      encodedBodyBytes: sum.encodedBodyBytes + resource.encodedBodyBytes,
      transferBytes: sum.transferBytes + resource.transferBytes,
    }),
    { requests: 0, encodedBodyBytes: 0, transferBytes: 0 },
  );
}

async function measure(browser: Browser, target: URL, viewport: Viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.isMobile,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Performance.enable');

  const pending = new Set<Request>();
  const completed: Promise<Resource | null>[] = [];
  const failures: Failure[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => pending.add(request));
  page.on('requestfailed', (request) => {
    pending.delete(request);
    failures.push({
      url: publicUrl(request.url()),
      reason: request.failure()?.errorText ?? 'Request failed',
    });
  });
  page.on('requestfinished', (request) => {
    pending.delete(request);
    completed.push(
      safeWrapAsync(measureResource(request, target.origin)).then(
        ([error, resource]) => {
          if (error) {
            failures.push({
              url: publicUrl(request.url()),
              reason: error.message,
            });
            return null;
          }
          return resource;
        },
      ),
    );
  });

  const response = await page.goto(target.href, { waitUntil: 'load' });
  if (
    response?.status() !== 200 ||
    new URL(page.url()).pathname !== target.pathname
  ) {
    throw new Error(
      `Expected a working page at ${target.pathname}, got ${response?.status()} at ${publicUrl(page.url())}`,
    );
  }
  // Live rooms never reach network-idle. Use the same bounded window per run.
  await page.waitForTimeout(sampleDurationMs);
  const metrics: Metrics = await session.send('Performance.getMetrics');
  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;
    return {
      domContentLoadedMs: entry.domContentLoadedEventEnd,
      loadMs: entry.loadEventEnd,
    };
  });
  const unfinished = [...pending].map((request) => ({
    url: publicUrl(request.url()),
    type: request.resourceType(),
  }));
  const resources = (await Promise.all(completed)).filter(
    (resource) => resource !== null,
  );
  const result = {
    path: target.pathname,
    viewport: viewport.name,
    ...navigation,
    scriptDurationMs:
      (metrics.metrics.find((metric) => metric.name === 'ScriptDuration')
        ?.value ?? 0) * 1000,
    taskDurationMs:
      (metrics.metrics.find((metric) => metric.name === 'TaskDuration')
        ?.value ?? 0) * 1000,
    firstParty: totals(resources.filter((resource) => resource.firstParty)),
    thirdParty: totals(resources.filter((resource) => !resource.firstParty)),
    resources: resources.sort(
      (a, b) => b.encodedBodyBytes - a.encodedBodyBytes,
    ),
    unfinished,
    failures: [...failures],
    errors: [...errors],
  };
  await context.close();
  return result;
}

async function report(browser: Browser, origin: string, roomPath: string) {
  const results = [];
  for (const viewport of viewports) {
    for (const path of ['/', roomPath]) {
      for (let run = 1; run <= repetitions; run++) {
        results.push({
          run,
          ...(await measure(browser, new URL(path, origin), viewport)),
        });
      }
    }
  }
  return {
    browser: browser.version(),
    capturedAt: new Date().toISOString(),
    sampleDurationMs,
    repetitions,
    throttling: 'none',
    results,
  };
}

async function main() {
  const [base, roomPath] = process.argv.slice(2);
  if (!base || !roomPath?.startsWith('/') || roomPath.startsWith('//')) {
    throw new Error(
      'Usage: pnpm measure:frontend http://127.0.0.1:3107 /test-room',
    );
  }
  const target = new URL(base);
  const room = new URL(roomPath, target);
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
    target.protocol !== 'http:' ||
    room.origin !== target.origin ||
    room.pathname === '/' ||
    room.search ||
    room.hash
  ) {
    throw new Error('Use a local production build, not the deployed site');
  }
  const browser = await chromium.launch();
  const [error, result] = await safeWrapAsync(
    report(browser, target.origin, roomPath),
  );
  await browser.close();
  if (error) throw error;
  console.log(JSON.stringify(result, null, 2));
}

const [error] = await safeWrapAsync(main());
if (error) {
  console.error(error.message);
  process.exitCode = 1;
}
