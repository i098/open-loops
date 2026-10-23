import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchEvidence, groupLoops, EVIDENCE_COLUMNS } from '../server/snowflake.mjs';
import { validatePack, cardPack } from '../server/claude.mjs';

const cfg = {
  origin: 'https://acct.snowflakecomputing.com',
  token: 'pat',
  database: 'OPEN_LOOPS',
  schema: 'PUBLIC',
  warehouse: 'COMPUTE_WH',
  view: 'LOOP_EVIDENCE',
  owner: "Alex'; DROP TABLE x; --",
};
const rowType = EVIDENCE_COLUMNS.map((name) => ({ name }));
const row = (loop, ev) =>
  EVIDENCE_COLUMNS.map((c) => (c === 'LOOP_ID' ? loop : c === 'EVIDENCE_ID' ? ev : `${c}-v`));
const reply = (status, json) => ({
  status,
  ok: status < 400,
  json: async () => json,
  text: async () => JSON.stringify(json),
});

test('snowflake: binds the owner, polls 202, and reads every partition once', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (init.method === 'POST') return reply(202, { statementHandle: 'h1' });
    if (url.endsWith('/h1') && calls.length === 2) return reply(202, { statementHandle: 'h1' });
    if (url.endsWith('/h1'))
      return reply(200, {
        statementHandle: 'h1',
        resultSetMetaData: { rowType, partitionInfo: [{}, {}] },
        data: [row('A', 'A#1')],
      });
    if (url.endsWith('?partition=1'))
      return reply(200, { data: [row('A', 'A#2'), row('B', 'B#1')] });
    throw Error(`unexpected ${url}`);
  };
  const rows = await fetchEvidence(cfg, { fetchImpl, pollMs: 1 });
  const body = JSON.parse(calls[0].init.body);
  assert.ok(!body.statement.includes('DROP'), 'owner must never be interpolated');
  assert.equal(body.bindings[1].value, cfg.owner);
  assert.equal(
    calls[0].init.headers['X-Snowflake-Authorization-Token-Type'],
    'PROGRAMMATIC_ACCESS_TOKEN',
  );
  assert.equal(calls.filter((c) => c.url.includes('partition=1')).length, 1);
  const loops = groupLoops(rows);
  assert.deepEqual(
    loops.map((l) => [l.LOOP_ID, l.evidence.map((e) => e.id)]),
    [
      ['A', ['A#1', 'A#2']],
      ['B', ['B#1']],
    ],
  );
});

test('snowflake: 401, 429 and a missing column fail closed', async () => {
  await assert.rejects(
    fetchEvidence(cfg, { fetchImpl: async () => reply(401, {}) }),
    /denied access \(401\)/,
  );
  await assert.rejects(
    fetchEvidence(cfg, { fetchImpl: async () => reply(429, {}) }),
    /rate limited/,
  );
  const short = async () =>
    reply(200, { resultSetMetaData: { rowType: rowType.slice(1) }, data: [] });
  await assert.rejects(fetchEvidence(cfg, { fetchImpl: short }), /missing column LOOP_ID/);
});

const loop = {
  LOOP_ID: 'REQ-184',
  evidence: [
    {
      id: 'REQ-184#c3',
      text: "The laptop arrived under REQ-221. This request is a duplicate; we don't need another.",
    },
    { id: 'REQ-221#status', text: 'REQ-221 status: Fulfilled.' },
  ],
};
const action = {
  label: 'Draft a note',
  help: 'Sends nothing',
  output: 'One draft',
  brief: 'Draft only.',
};
const pack = (over = {}) => ({
  headline: 'A\nB',
  body: 'b',
  short: 's',
  why: 'w',
  quote: 'This request is a duplicate',
  quote_evidence_id: 'REQ-184#c3',
  actions: [action, action],
  ...over,
});

test('claude: packs must quote cited evidence verbatim and carry 2-3 actions', () => {
  assert.ok(validatePack(loop, pack()));
  assert.equal(
    validatePack(loop, pack({ quote_evidence_id: '[1]' })).quote_evidence_id,
    'REQ-184#c3',
  );
  assert.throws(
    () => validatePack(loop, pack({ quote: 'This request is approved' })),
    /not verbatim/,
  );
  assert.throws(
    () => validatePack(loop, pack({ quote_evidence_id: 'OTHER#1' })),
    /unknown evidence/,
  );
  assert.throws(() => validatePack(loop, pack({ actions: [action] })), /2-3 actions/);
  assert.throws(
    () => validatePack(loop, pack({ actions: [action, { ...action, brief: '' }] })),
    /action missing brief/,
  );
});

test('claude: a truncated or text-only response yields no card', async () => {
  const cfgC = { base: 'https://api.anthropic.com', key: 'k', model: 'm' };
  const textOnly = async () =>
    reply(200, { content: [{ type: 'text', text: 'hi' }], stop_reason: 'end_turn' });
  await assert.rejects(cardPack(cfgC, loop, { fetchImpl: textOnly }), /No complete card pack/);
  const truncated = async () =>
    reply(200, {
      content: [{ type: 'tool_use', name: 'emit_card_pack', input: pack() }],
      stop_reason: 'max_tokens',
    });
  await assert.rejects(cardPack(cfgC, loop, { fetchImpl: truncated }), /No complete card pack/);
  const good = async (url, init) => {
    assert.equal(init.headers['x-api-key'], 'k');
    return reply(200, {
      model: 'm',
      content: [{ type: 'tool_use', name: 'emit_card_pack', input: pack({ headline: 'A\\nB' }) }],
      stop_reason: 'tool_use',
    });
  };
  const out = await cardPack(cfgC, loop, { fetchImpl: good });
  assert.equal(out.pack.headline, 'A\nB');
});
