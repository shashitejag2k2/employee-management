import fs from 'node:fs';
import yaml from 'js-yaml';

function loadYaml(path) {
  const text = fs.readFileSync(path, 'utf8');
  return yaml.load(text);
}

function normalizePath(path) {
  // repo openapi.yaml uses servers: /api/v1 so paths are like /employees
  // backend openapi uses full path: /api/v1/employees
  if (path.startsWith('/api/v1')) return path.slice('/api/v1'.length) || '/';
  return path;
}

function methodSetForPaths(spec) {
  const result = new Set();
  const paths = spec?.paths ?? {};
  for (const [p, item] of Object.entries(paths)) {
    const np = normalizePath(p);
    for (const m of Object.keys(item ?? {})) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(m)) {
        result.add(`${m.toUpperCase()} ${np}`);
      }
    }
  }
  return result;
}

const repoPath = process.argv[2] ?? 'openapi.yaml';
const backendPath = process.argv[3] ?? 'backend-openapi.yaml';

const repoSpec = loadYaml(repoPath);
const backendSpec = loadYaml(backendPath);

const repoSet = methodSetForPaths(repoSpec);
const backendSet = methodSetForPaths(backendSpec);

const missing = [];
for (const entry of backendSet) {
  if (!repoSet.has(entry)) missing.push(entry);
}

if (missing.length) {
  console.error('Repo openapi.yaml is missing endpoints exposed by backend:');
  for (const m of missing.sort()) console.error(`- ${m}`);
  process.exit(1);
}

console.log('OK: Repo openapi.yaml covers all backend-exposed endpoints (paths/methods).');
