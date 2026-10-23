import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'yaml';
import { runInNewContext } from 'node:vm';

const workflow = parse(
  readFileSync(new URL('../.github/workflows/quality.yml', import.meta.url), 'utf8'),
);

test('every PR has a stable final gate, even if all expensive checks skip', () => {
  assert.ok(Object.hasOwn(workflow.on, 'pull_request'));
  assert.equal(workflow.on.pull_request?.paths, undefined);
  assert.equal(workflow.on.pull_request?.['paths-ignore'], undefined);
  assert.equal(workflow.jobs.gate.name, 'PR gate');
  assert.equal(runInNewContext(workflow.jobs.gate.if, { always: () => true }), true);
  assert.deepEqual(workflow.jobs.gate.needs, ['detect', 'format', 'lint', 'test', 'sentrux']);
});

test('fork-safe workflow runs unprivileged with immutable official Actions', () => {
  assert.equal(workflow.on.pull_request_target, undefined);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  for (const job of Object.values(workflow.jobs)) {
    assert.equal(job['continue-on-error'], undefined);
    assert.equal(job.permissions, undefined);
    for (const step of job.steps) {
      assert.equal(step['continue-on-error'], undefined);
      if (step.uses) assert.match(step.uses, /^actions\/[a-z-]+@[a-f0-9]{40}$/);
      if (step.uses?.startsWith('actions/checkout@'))
        assert.equal(step.with['persist-credentials'], false);
    }
  }
});

test('successful gated runs deliver only on main, explicit dispatch, or changed packaged PR input', () => {
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.deepEqual(workflow.jobs.delivery.needs, ['detect', 'gate']);
  const eligible = (event, branch, changed) =>
    runInNewContext(workflow.jobs.delivery.if, {
      github: { event_name: event, ref: branch },
      needs: { detect: { outputs: { bundle: String(changed) } } },
    });
  assert.equal(eligible('push', 'refs/heads/main', true), true);
  assert.equal(eligible('push', 'refs/heads/main', false), false);
  assert.equal(eligible('push', 'refs/heads/feature', true), false);
  assert.equal(eligible('pull_request', 'refs/pull/1/merge', true), true);
  assert.equal(eligible('pull_request', 'refs/pull/1/merge', false), false);
  assert.equal(eligible('workflow_dispatch', 'refs/heads/feature', false), true);
  const upload = workflow.jobs.delivery.steps.find((step) =>
    step.uses?.startsWith('actions/upload-artifact@'),
  );
  assert.equal(upload.with['if-no-files-found'], 'error');
  assert.equal(upload.with.path, 'dist/open-loops-preview.tar.gz');
});
