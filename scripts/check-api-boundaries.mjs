import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const webRouteSourceDirectories = [
  'apps/admin/src',
  'apps/cast',
  'apps/embed/src',
  'apps/platform/src',
  'apps/remote/src',
  'apps/tv/src/tizen',
];
const nativeSourceDirectories = ['apps/mobile/src', 'apps/tv/src'];
const literalRequestCallPattern =
  /\.[ \t]*(?:delete|get|patch|post|put|roomExists)[ \t]*\([ \t\r\n]*['"]\//;
const requestCapabilityPattern =
  /\buse[A-Z][A-Za-z0-9]*(?:Request|Requests)\s*\(/;
const requestFactoryPattern =
  /\bcreate[A-Z][A-Za-z0-9]*(?:Request|Requests)\s*\(/;
const routeDataModulePattern =
  /\/(?:action|clientAction|clientLoader|loader)\.(?:ts|tsx)$/;

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (['node_modules', 'dist', 'build', '.expo'].includes(entry.name))
      return [];
    if (entry.isDirectory()) return listSourceFiles(path);
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [path] : [];
  });
}

function hasClientRequestCall(source) {
  if (literalRequestCallPattern.test(source)) return true;

  const clientNames = new Set(['api', 'serverApi']);
  const clientDeclarationPattern =
    /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:createApiClient|getServerApi)\s*\(/g;
  for (const match of source.matchAll(clientDeclarationPattern)) {
    clientNames.add(match[1]);
  }

  const typedClientPattern =
    /\b([A-Za-z_$][\w$]*)\s*:\s*(?:ApiClient|ReturnType<\s*typeof\s+(?:createApiClient|getServerApi)\s*>)/g;
  for (const match of source.matchAll(typedClientPattern)) {
    clientNames.add(match[1]);
  }

  let foundAlias = true;
  while (foundAlias) {
    foundAlias = false;
    const aliasPattern =
      /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\b/g;
    for (const match of source.matchAll(aliasPattern)) {
      if (!clientNames.has(match[2]) || clientNames.has(match[1])) continue;
      clientNames.add(match[1]);
      foundAlias = true;
    }
  }

  return [
    ...source.matchAll(
      /\b([A-Za-z_$][\w$]*)\.(?:delete|get|patch|post|put|roomExists)\s*\(/g,
    ),
  ].some((match) => clientNames.has(match[1]));
}

const violations = [];

for (const directory of ['apps/mobile/src/routes', 'apps/tv/src/routes']) {
  if (existsSync(directory) && listSourceFiles(directory).length > 0) {
    violations.push(
      `${directory}: native apps must not have a second route tree`,
    );
  }
}

const allowedApiHooks = new Set([
  'useAdminEvents',
  'useRemoteEvents',
  'useRoomEventsV3',
  'useRoomMessages',
]);
const allowedApiHookFiles = new Set(
  [...allowedApiHooks].map(
    (hookName) => `packages/api/src/hooks/${hookName}.ts`,
  ),
);
const apiPackage = JSON.parse(
  readFileSync('packages/api/package.json', 'utf8'),
);
for (const [groupName, dependencyGroup, forbiddenDependencies] of [
  [
    'dependencies',
    apiPackage.dependencies,
    ['@types/react', 'react', 'react-dom'],
  ],
  [
    'peerDependencies',
    apiPackage.peerDependencies,
    ['@types/react', 'react-dom'],
  ],
  ['devDependencies', apiPackage.devDependencies, ['react', 'react-dom']],
]) {
  for (const dependency of forbiddenDependencies) {
    if (!dependencyGroup || !(dependency in dependencyGroup)) continue;
    violations.push(
      `packages/api/package.json: ${dependency} is forbidden in ${groupName}`,
    );
  }
}

for (const file of listSourceFiles('packages/api/src')) {
  const repositoryPath = relative('.', file);
  const source = readFileSync(file, 'utf8');
  const isHookFile = repositoryPath.includes('/hooks/');
  if (isHookFile && !allowedApiHookFiles.has(repositoryPath)) {
    violations.push(
      `${repositoryPath}: only approved SSE hooks may live in @vibes/api`,
    );
  }
  if (/from\s+['"]react(?:\/[^'"]*)?['"]/.test(source) && !isHookFile) {
    violations.push(
      `${repositoryPath}: only @vibes/api SSE hooks may import React`,
    );
  }
  if (/from\s+['"]@vibes\/shared['"]/.test(source)) {
    violations.push(
      `${repositoryPath}: @vibes/api must not import the React-capable @vibes/shared barrel`,
    );
  }
  const hookDeclarationPattern =
    /\b(?:export\s+)?(?:const|function|let|var)\s+(use[A-Z][A-Za-z0-9]*)/g;
  for (const match of source.matchAll(hookDeclarationPattern)) {
    if (isHookFile && allowedApiHooks.has(match[1])) continue;
    violations.push(
      `${repositoryPath}: only SSE hooks may be exported by @vibes/api`,
    );
  }
  if (isHookFile && hasClientRequestCall(source)) {
    violations.push(
      `${repositoryPath}: @vibes/api hooks must never execute REST requests`,
    );
  }
  if (isHookFile && /from\s+['"][^'"]*requests\//.test(source)) {
    violations.push(
      `${repositoryPath}: @vibes/api hooks must not import REST capabilities`,
    );
  }
}

for (const sourceDirectory of webRouteSourceDirectories) {
  for (const file of listSourceFiles(sourceDirectory)) {
    const repositoryPath = relative('.', file);
    const source = readFileSync(file, 'utf8');
    if (
      /\/(?:route|root)\.tsx?$/.test(repositoryPath) &&
      /export\s+(?:async\s+)?(?:function|const|let)\s+(?:ErrorBoundary|HydrateFallback|shouldRevalidate|meta|links|loader|clientLoader|action|clientAction)\b/.test(
        source,
      )
    ) {
      violations.push(
        `${repositoryPath}: route hooks and boundaries must live in separate files and be re-exported`,
      );
    }
    if (
      requestCapabilityPattern.test(source) ||
      requestFactoryPattern.test(source)
    ) {
      if (routeDataModulePattern.test(repositoryPath)) continue;
      violations.push(
        `${repositoryPath}: request hooks and endpoint helpers are not allowed outside Smolter route data modules`,
      );
    }
    if (!hasClientRequestCall(source)) continue;
    if (routeDataModulePattern.test(repositoryPath)) continue;
    violations.push(
      `${repositoryPath}: REST calls must run in a loader, clientLoader, action, or clientAction`,
    );
  }
}

for (const sourceDirectory of nativeSourceDirectories) {
  for (const file of listSourceFiles(sourceDirectory)) {
    const repositoryPath = relative('.', file);
    if (repositoryPath.includes('/tizen/')) continue;
    const source = readFileSync(file, 'utf8');
    const isRequestModule = repositoryPath.includes('/src/requests/');
    const isApiConstructionModule = /\/lib\/api\.ts$/.test(repositoryPath);
    if (routeDataModulePattern.test(repositoryPath)) {
      violations.push(
        `${repositoryPath}: native requests are not route loaders/actions`,
      );
    }
    if (hasClientRequestCall(source) && !isRequestModule) {
      violations.push(
        `${repositoryPath}: native REST calls must run in typed request functions`,
      );
    }
    if (requestFactoryPattern.test(source) && !isRequestModule) {
      violations.push(
        `${repositoryPath}: native request capabilities must be constructed in request modules`,
      );
    }
    if (
      /createApiClient[A-Za-z]*\s*\(/.test(source) &&
      !isApiConstructionModule &&
      !isRequestModule
    ) {
      violations.push(
        `${repositoryPath}: native API clients must be constructed in the app API module or request modules`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Frontend API boundaries are valid.');
}
