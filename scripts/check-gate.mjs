import { pathToFileURL } from 'node:url';

export function verifyGate(needs) {
  if (needs.detect?.result !== 'success') throw new Error('Path detection did not succeed');
  for (const name of ['format', 'lint', 'test', 'sentrux']) {
    const expected = needs.detect.outputs[name];
    if (!['true', 'false'].includes(expected)) throw new Error(`Missing check selection: ${name}`);
    const actual = needs[name]?.result;
    if (expected === 'true' && actual !== 'success') {
      throw new Error(`Required ${name} check ended ${actual ?? 'missing'}`);
    }
    if (expected === 'false' && !['success', 'skipped'].includes(actual)) {
      throw new Error(`Irrelevant ${name} check unexpectedly ended ${actual ?? 'missing'}`);
    }
  }
  return 'All applicable checks passed; irrelevant checks skipped.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(verifyGate(JSON.parse(process.env.CHECK_RESULTS)));
}
