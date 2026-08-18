import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const reactRouterSourceDirectories = [
  'apps/admin/src',
  'apps/cast',
  'apps/embed/src',
  'apps/platform/src',
  'apps/remote/src',
  'apps/tv/src/tizen',
];
const nativeSourceDirectories = ['apps/mobile/src', 'apps/tv/src'];
const requestMethodPattern = '(?:delete|get|patch|post|put|roomExists)';
const literalRequestCallPattern = new RegExp(
  `\\.[ \\t]*${requestMethodPattern}[ \\t]*\\([ \\t\\r\\n]*['"]\\/`,
);
const requestCapabilityPattern =
  /\buse[A-Z][A-Za-z0-9]*(?:Request|Requests)\s*\(/;
const requestFactoryPattern =
  /\bcreate[A-Z][A-Za-z0-9]*(?:Request|Requests)\s*\(/;
const routeDataModulePattern =
  /\/(?:action|clientAction|clientLoader|loader)\.(?:ts|tsx)$/;

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [path] : [];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  return [...clientNames].some((clientName) =>
    new RegExp(
      `\\b${escapeRegExp(clientName)}\\.${requestMethodPattern}\\s*\\(`,
    ).test(source),
  );
}

const violations = [];

for (const file of listSourceFiles('apps/mobile/src/app')) {
  const repositoryPath = relative('.', file);
  const source = readFileSync(file, 'utf8');
  if (/\b(?:class|const|function|let|var)\b|<[A-Z][A-Za-z0-9.]*/.test(source)) {
    violations.push(
      `${repositoryPath}: Expo Router files must be re-export-only adapters`,
    );
  }
  const routeTargets = [...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)];
  if (routeTargets.length === 0) {
    violations.push(
      `${repositoryPath}: Expo Router adapter must re-export a route module`,
    );
  }
  for (const match of routeTargets) {
    const target = match[1];
    if (!target.startsWith('@/routes/') || !target.endsWith('/route')) {
      violations.push(
        `${repositoryPath}: Expo Router adapters may only re-export src/routes/*/route.tsx`,
      );
      continue;
    }
    const targetFile = join(
      'apps/mobile/src',
      `${target.replace(/^@\//, '')}.tsx`,
    );
    if (!existsSync(targetFile)) {
      violations.push(`${repositoryPath}: missing route module ${targetFile}`);
    }
  }
}

for (const file of listSourceFiles('apps/mobile/src/routes')) {
  if (!/(?:^|\/)(?:component|components)\.tsx$/.test(file)) continue;
  violations.push(
    `${relative('.', file)}: route pages must be named route.tsx; route-specific components belong in a components directory`,
  );
}

const allowedApiHooks = new Set([
  'useAdminEvents',
  'useRemoteEvents',
  'useRoomEvents',
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

for (const sourceDirectory of reactRouterSourceDirectories) {
  for (const file of listSourceFiles(sourceDirectory)) {
    const repositoryPath = relative('.', file);
    const source = readFileSync(file, 'utf8');
    if (
      requestCapabilityPattern.test(source) ||
      requestFactoryPattern.test(source)
    ) {
      if (routeDataModulePattern.test(repositoryPath)) continue;
      violations.push(
        `${repositoryPath}: request hooks and endpoint helpers are not allowed in React Router apps`,
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
    const isRouteDataModule = routeDataModulePattern.test(repositoryPath);
    const isApiConstructionModule = /\/lib\/api\.ts$/.test(repositoryPath);
    if (hasClientRequestCall(source) && !isRouteDataModule) {
      violations.push(
        `${repositoryPath}: native REST calls must run in a loader or action`,
      );
    }
    if (requestFactoryPattern.test(source) && !isRouteDataModule) {
      violations.push(
        `${repositoryPath}: native request capabilities must be constructed in a loader or action`,
      );
    }
    if (
      /createApiClient[A-Za-z]*\s*\(/.test(source) &&
      !isApiConstructionModule &&
      !isRouteDataModule
    ) {
      violations.push(
        `${repositoryPath}: native API clients must be constructed in the app API module or route data modules`,
      );
    }
  }
}

for (const packageDirectory of [
  'apps/admin',
  'apps/cast',
  'apps/embed',
  'apps/platform',
  'apps/remote',
  'packages/api',
  'packages/models',
  'packages/serve',
  'packages/shared',
  'packages/tailwind',
  'packages/ui',
]) {
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  );
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (manifest[group]?.['@vibes/native-router']) {
      violations.push(
        `${packageDirectory}/package.json: @vibes/native-router is restricted to mobile and TV apps`,
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
