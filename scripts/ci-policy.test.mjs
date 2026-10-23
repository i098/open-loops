import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changedPaths, selectChecks } from './ci-scope.mjs';
import { verifyGate } from './check-gate.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const all = {
  format: true,
  lint: true,
  code_lint: true,
  docs_lint: true,
  test: true,
  sentrux: true,
  bundle: true,
};

test('workflow and toolchain changes select every applicable check', () => {
  for (const path of [
    '.github/workflows/quality.yml',
    'package-lock.json',
    'scripts/ci-scope.mjs',
    '.sentrux/rules.toml',
  ]) {
    assert.deepEqual(selectChecks([path]), all);
  }
});

test('docs and unrelated binary changes do not run application tests or Sentrux', () => {
  for (const path of [
    'PLAN.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'SUPPORT.md',
    'CODE_OF_CONDUCT.md',
    'CHANGELOG.md',
    'CREDITS.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
  ]) {
    assert.deepEqual(selectChecks([path]), {
      format: true,
      lint: true,
      code_lint: false,
      docs_lint: true,
      test: false,
      sentrux: false,
      bundle: true,
    });
  }
  assert.deepEqual(selectChecks(['.github/ISSUE_TEMPLATE/bug_report.yml']), {
    format: true,
    lint: false,
    code_lint: false,
    docs_lint: false,
    test: false,
    sentrux: false,
    bundle: true,
  });
  assert.deepEqual(selectChecks(['docs/images/card.png']), {
    format: false,
    lint: false,
    code_lint: false,
    docs_lint: false,
    test: false,
    sentrux: false,
    bundle: true,
  });
  assert.deepEqual(selectChecks(['previews/assets/pip.svg']), {
    format: true,
    lint: false,
    code_lint: false,
    docs_lint: false,
    test: true,
    sentrux: false,
    bundle: true,
  });
});

test('application JavaScript selects code checks but not unrelated Markdown lint', () => {
  assert.deepEqual(selectChecks(['previews/assets/open-loops.js']), { ...all, docs_lint: false });
});

test('unpackaged Markdown changes skip browser work and artifact rebuild', () => {
  const selection = selectChecks(['notes/research.md']);
  assert.equal(selection.format, true);
  assert.equal(selection.docs_lint, true);
  assert.equal(selection.test, false);
  assert.equal(selection.sentrux, false);
  assert.equal(selection.bundle, false);
});

function outcomes(selected) {
  return {
    detect: {
      result: 'success',
      outputs: Object.fromEntries(
        Object.entries(selected).map(([key, value]) => [key, String(value)]),
      ),
    },
    ...Object.fromEntries(
      Object.entries(selected).map(([key, value]) => [
        key,
        { result: value ? 'success' : 'skipped' },
      ]),
    ),
  };
}

test('required gate accepts truly irrelevant skips and rejects every relevant non-success', () => {
  assert.match(verifyGate(outcomes(selectChecks(['docs/images/card.png']))), /passed/);
  assert.match(verifyGate(outcomes(all)), /passed/);
  for (const result of ['failure', 'cancelled', 'skipped', undefined]) {
    const needs = outcomes(all);
    needs.sentrux.result = result;
    assert.throws(() => verifyGate(needs), /Required sentrux/);
  }
});

test('required gate fails when detection failed, selection is absent, or unexpected job failed', () => {
  const failed = outcomes(all);
  failed.detect.result = 'failure';
  assert.throws(() => verifyGate(failed), /Path detection/);
  const absent = outcomes(all);
  delete absent.detect.outputs.test;
  assert.throws(() => verifyGate(absent), /Missing check selection/);
  const unexpected = outcomes(selectChecks(['docs/images/card.png']));
  unexpected.test.result = 'cancelled';
  assert.throws(() => verifyGate(unexpected), /unexpectedly/);
});

test('rename detection retains the deleted runtime path when extension and directory change', () => {
  const directory = mkdtempSync(join(tmpdir(), 'open-loops-scope-'));
  const git = (...args) => execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  const commit = (message) =>
    git('-c', 'user.name=CI test', '-c', 'user.email=ci@example.invalid', 'commit', '-qm', message);
  try {
    git('init', '-q');
    mkdirSync(join(directory, 'previews', 'assets'), { recursive: true });
    writeFileSync(join(directory, 'previews', 'assets', 'runtime.js'), 'globalThis.ready = true;');
    git('add', '.');
    commit('runtime');
    const before = git('rev-parse', 'HEAD');
    mkdirSync(join(directory, 'docs'));
    renameSync(
      join(directory, 'previews', 'assets', 'runtime.js'),
      join(directory, 'docs', 'example.txt'),
    );
    git('add', '-A');
    commit('rename');
    const paths = changedPaths({ before }, 'push', directory);
    assert.deepEqual(new Set(paths), new Set(['previews/assets/runtime.js', 'docs/example.txt']));
    assert.equal(selectChecks(paths).test, true);
    assert.equal(selectChecks(paths).sentrux, true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
