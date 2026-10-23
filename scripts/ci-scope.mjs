import { appendFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function selectChecks(paths) {
  const all = paths.some((path) =>
    /^(?:\.github\/workflows\/|scripts\/|package(?:-lock)?\.json$|\.nvmrc$|\.gitignore$|\.gitattributes$|eslint\.config\.|playwright\.config\.|\.prettier|\.htmlvalidate|\.stylelint|\.markdownlint|\.sentrux\/)/.test(
      path,
    ),
  );
  const codeLint = all || paths.some((path) => /\.(?:html|css|js|mjs|cjs)$/.test(path));
  const docsLint = all || paths.some((path) => /\.md$/.test(path));
  return {
    format:
      all || paths.some((path) => /\.(?:html|css|js|mjs|cjs|md|json|jsonc|ya?ml|svg)$/.test(path)),
    lint: codeLint || docsLint,
    code_lint: codeLint,
    docs_lint: docsLint,
    test: all || paths.some((path) => /^(?:previews\/|tests\/|server\/|data\/)/.test(path)),
    sentrux:
      all || paths.some((path) => /^(?:previews\/|tests\/).+\.(?:html|css|js|mjs|cjs)$/.test(path)),
    bundle:
      all ||
      paths.some((path) =>
        /^(?:previews\/|docs\/|\.github\/(?:ISSUE_TEMPLATE\/|PULL_REQUEST_TEMPLATE\.md$)|(?:README|PLAN|CONTRIBUTING|SECURITY|SUPPORT|CODE_OF_CONDUCT|CHANGELOG|CREDITS)\.md$)/.test(
          path,
        ),
      ),
  };
}

export function changedPaths(event, name, cwd = process.cwd()) {
  const before = name === 'pull_request' ? event.pull_request.base.sha : event.before;
  const args =
    before && !/^0+$/.test(before)
      ? ['diff', '--no-renames', '--name-only', '-z', before, 'HEAD']
      : ['ls-files', '-z'];
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).split('\0').filter(Boolean);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const paths = changedPaths(event, process.env.GITHUB_EVENT_NAME);
  const checks = selectChecks(paths);
  const output = Object.entries(checks)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n');
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
  appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`);
  console.log(JSON.stringify({ paths, checks }, null, 2));
}
