import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const version = '0.5.7';
const releases = {
  'linux-x64': {
    target: 'linux-x86_64',
    binary: '3237f80fe20d54aad4deefa8a143f0d60543bb5d2d6ad891eb42432f155725a6',
    grammars: '8849f1eb07df3f6d4ea1ed422d8dee4b9b79a250682fa5646675dae466554454',
  },
  'darwin-arm64': {
    target: 'darwin-arm64',
    binary: '30ae1a44d4478adf294019fce6d65ce5686c25bc863eb715b320c5234927f6c2',
    grammars: '942a1597fae6c33823dcf7158a9850e4b67258cadf89100c20c980fc3abaf48f',
  },
};
const root = resolve(import.meta.dirname, '..');

async function download(name, expected, destination) {
  const url = `https://github.com/sentrux/sentrux/releases/download/v${version}/${name}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sentrux download ${response.status}: ${name}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) throw new Error(`Sentrux checksum mismatch: ${name}`);
  writeFileSync(destination, bytes, { mode: 0o700 });
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'vendor') return [];
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected source symlink: ${path}`);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:js|mjs|cjs)$/.test(entry.name) ? [path] : [];
  });
}

function prepareSources(scan) {
  const app = sourceFiles(join(root, 'previews', 'assets'));
  if (app.length === 0)
    throw new Error('No extracted application JavaScript; refusing a zero-source Sentrux pass');
  const sources = [
    ...app,
    ...sourceFiles(join(root, 'scripts')),
    ...sourceFiles(join(root, 'tests')),
  ];
  for (const source of sources) {
    if (!readFileSync(source, 'utf8').trim()) throw new Error(`Empty source file: ${source}`);
    const destination = join(scan, relative(root, source));
    mkdirSync(resolve(destination, '..'), { recursive: true });
    cpSync(source, destination);
  }
  mkdirSync(join(scan, '.sentrux'), { recursive: true });
  cpSync(join(root, '.sentrux', 'rules.toml'), join(scan, '.sentrux', 'rules.toml'));
  console.log(
    `Sentrux input: ${app.length} application JS files, ${sources.length} total first-party JS files`,
  );
  return sources.length;
}

async function install(temporary, release) {
  const home = join(temporary, 'home');
  const plugins = join(home, '.sentrux', 'plugins');
  mkdirSync(plugins, { recursive: true });
  writeFileSync(join(home, '.sentrux', 'telemetry_opt_out'), '');
  const binary = join(temporary, 'sentrux');
  const grammars = join(temporary, 'grammars.tar.gz');
  await download(`sentrux-${release.target}`, release.binary, binary);
  await download(`grammars-${release.target}.tar.gz`, release.grammars, grammars);
  execFileSync('tar', ['-xzf', grammars, '-C', plugins]);
  const extension = process.platform === 'darwin' ? 'dylib' : 'so';
  const grammar = join(plugins, 'javascript', 'grammars', `${release.target}.${extension}`);
  if (readFileSync(grammar).length === 0) throw new Error('JavaScript grammar is empty');
  return { binary, env: { ...process.env, HOME: home, SENTRUX_SKIP_GRAMMAR_DOWNLOAD: '1' } };
}

async function check() {
  const release = releases[`${process.platform}-${process.arch}`];
  if (!release)
    throw new Error(`Pinned Sentrux runner unavailable for ${process.platform}-${process.arch}`);
  const temporary = mkdtempSync(join(tmpdir(), 'open-loops-sentrux-'));
  try {
    const scan = join(temporary, 'source');
    mkdirSync(scan);
    const expected = prepareSources(scan);
    const tool = await install(temporary, release);
    const actualVersion = execFileSync(tool.binary, ['--version'], {
      env: tool.env,
      encoding: 'utf8',
    }).trim();
    if (actualVersion !== `sentrux ${version}`)
      throw new Error(`Unexpected Sentrux version: ${actualVersion}`);
    const result = spawnSync(tool.binary, ['check', scan], { env: tool.env, encoding: 'utf8' });
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(
        `Sentrux check failed: exit ${result.status}, signal ${result.signal ?? 'none'}`,
      );
    const counts = [...(result.stderr ?? '').matchAll(/\[build_graphs\]\s+(\d+) files/g)].map(
      (match) => Number(match[1]),
    );
    if (!counts.includes(expected))
      throw new Error(
        `Sentrux source coverage missing: expected ${expected} files, observed ${counts.join(', ') || 'none'}`,
      );
    console.log(`Sentrux ${version}: strict rules passed on ${expected} first-party JS files`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

await check();
