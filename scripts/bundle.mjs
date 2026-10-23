import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist');
for (const page of ['open-loops.html', 'personal-observability.html']) {
  if (!existsSync(join(root, 'previews', page)))
    throw new Error(`Missing verified preview: ${page}`);
}
mkdirSync(output, { recursive: true });
const temporary = mkdtempSync(join(output, 'bundle-'));
const stage = join(temporary, 'open-loops-preview');
mkdirSync(stage);
for (const path of ['previews', 'docs', 'README.md', 'PLAN.md']) {
  cpSync(join(root, path), join(stage, path), { recursive: true, dereference: false });
}

function entries(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Bundle may not contain symlinks: ${path}`);
    return entry.isDirectory() ? entries(path) : [path];
  });
}

const files = entries(stage)
  .sort()
  .map((path) => ({
    path: relative(stage, path),
    sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
  }));
writeFileSync(
  join(stage, 'manifest.json'),
  `${JSON.stringify({ commit: process.env.GITHUB_SHA ?? null, files }, null, 2)}\n`,
);
execFileSync(
  'tar',
  ['-czf', join(output, 'open-loops-preview.tar.gz'), '-C', temporary, 'open-loops-preview'],
  { stdio: 'inherit' },
);
rmSync(temporary, { recursive: true });
console.log(
  `Created dist/open-loops-preview.tar.gz with ${files.length} verified input files and manifest.json`,
);
