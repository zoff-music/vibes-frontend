import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const reactRouterApps = ['admin', 'cast', 'embed', 'platform', 'remote'];
const requestMethodPattern = '(?:delete|get|patch|post|put|roomExists)';
const literalRequestCallPattern = new RegExp(
  `\\.[ \\t]*${requestMethodPattern}[ \\t]*\\([ \\t\\r\\n]*['"]\\/`,
);
const requestCapabilityPattern =
  /\buse[A-Z][A-Za-z0-9]*(?:Request|Requests)\s*\(/;
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
const apiPackage = JSON.parse(
  readFileSync('packages/api/package.json', 'utf8'),
);
for (const dependencyGroup of [
  apiPackage.dependencies,
  apiPackage.devDependencies,
  apiPackage.peerDependencies,
]) {
  if (!dependencyGroup) continue;
  for (const dependency of ['@types/react', 'react', 'react-dom']) {
    if (dependency in dependencyGroup) {
      violations.push(
        `packages/api/package.json: @vibes/api must not depend on ${dependency}`,
      );
    }
  }
}

for (const file of listSourceFiles('packages/api/src')) {
  const repositoryPath = relative('.', file);
  const source = readFileSync(file, 'utf8');
  if (repositoryPath.includes('/hooks/')) {
    violations.push(`${repositoryPath}: @vibes/api must not contain hooks`);
  }
  if (/from\s+['"]react(?:\/[^'"]*)?['"]/.test(source)) {
    violations.push(`${repositoryPath}: @vibes/api must remain React-free`);
  }
  if (/from\s+['"]@vibes\/shared['"]/.test(source)) {
    violations.push(
      `${repositoryPath}: @vibes/api must not import the React-capable @vibes/shared barrel`,
    );
  }
  if (/\b(?:export\s+)?(?:const|function|let|var)\s+use[A-Z]/.test(source)) {
    violations.push(
      `${repositoryPath}: @vibes/api must not export React hooks`,
    );
  }
}

for (const app of reactRouterApps) {
  const sourceDirectory = app === 'cast' ? `apps/${app}` : `apps/${app}/src`;
  for (const file of listSourceFiles(sourceDirectory)) {
    const repositoryPath = relative('.', file);
    const source = readFileSync(file, 'utf8');
    if (requestCapabilityPattern.test(source)) {
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

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('React Router API boundaries are valid.');
}
