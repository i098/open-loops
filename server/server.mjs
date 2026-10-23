#!/usr/bin/env node
// Open Loops live server: serves the companion and owns every network call.
// Snowflake evidence -> Claude card packs (streamed as SSE) -> accepted Claude read/draft jobs.
// The browser never sees a credential.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  snowflakeConfig,
  fetchEvidence,
  groupLoops,
  journal,
  runStatement,
  queryLog,
} from './snowflake.mjs';
import {
  claudeConfig,
  cardPack,
  runJob,
  cortexConfig,
  cortexCardPack,
  cortexRunJob,
} from './claude.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const previews = join(root, 'previews');
const port = Number(process.env.PORT || 4317);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

const sf = snowflakeConfig(),
  cortex = sf && cortexConfig(),
  claude = claudeConfig();
// With Snowflake connected, Claude runs inside Cortex (AI_COMPLETE); otherwise the Anthropic API.
const makePack = (loop, signal, picks) =>
  cortex
    ? cortexCardPack(sf, runStatement, cortex.model, loop, picks)
    : cardPack(claude, loop, { signal });
const makeJob = (loop, brief) =>
  cortex ? cortexRunJob(sf, runStatement, cortex.model, loop, brief) : runJob(claude, loop, brief);
const modelLabel = cortex ? `${cortex.model} via Snowflake Cortex` : claude?.model || null;
const loops = new Map(); // LOOP_ID -> loop with evidence, from the latest scan
const usage = { input_tokens: 0, output_tokens: 0, calls: 0 };
let evidenceLabel = sf
  ? `Snowflake ${sf.database}.${sf.schema}.${sf.view}`
  : 'Demo evidence (data/demo-evidence.json)';

async function loadEvidence() {
  if (sf) return groupLoops(await fetchEvidence(sf));
  return groupLoops(JSON.parse(await readFile(join(root, 'data/demo-evidence.json'), 'utf8')));
}

const journaled = { ok: 0, failed: 0, last_error: null };
function remember(loopId, event, model, detail) {
  if (!sf) return;
  journal(sf, loopId, event, model, detail).then(
    () => journaled.ok++,
    (err) => {
      journaled.failed++;
      journaled.last_error = err.message.slice(0, 160);
    },
  );
}

function track(u) {
  usage.calls++;
  usage.input_tokens += u?.input_tokens || 0;
  usage.output_tokens += u?.output_tokens || 0;
}

const ageText = (iso) => {
  const days = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 864e5));
  return days === 0 ? 'Today' : days === 1 ? '1 day old' : `${days} days old`;
};
const day = (iso) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
const escHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

// Shape a validated pack into the renderer's quest + copy contract.
function toQuest(loop, pack, model) {
  const id = loop.LOOP_ID.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [e1, e2] = loop.evidence;
  const quest = {
    id,
    kind: loop.KIND,
    age: ageText(loop.CREATED_AT),
    title: pack.headline.replace(/\n/g, ' '),
    why: pack.why,
    person: loop.COUNTERPART,
    record: loop.LOOP_ID,
    quote: `“${escHtml(pack.quote)}”`,
    cite: `[1] ${escHtml(e1.id)} · ${day(e1.at)}`,
    evidence: e2 ? `[2] ${escHtml(e2.id)} · ${escHtml(e2.text)}` : '',
    source: `${escHtml(evidenceLabel)}. Source: ${escHtml(loop.SOURCE_SYSTEM)}. Status: ${escHtml(loop.STATUS)}. Owner: ${escHtml(loop.OWNER)}. Card by ${escHtml(model)}.`,
    tasks: pack.actions.map((a) => ({ label: a.label, help: a.help, brief: a.brief, result: '' })),
  };
  const copy = {
    headline: pack.headline,
    body: pack.body,
    age: quest.age,
    short: pack.short,
    read: `${loop.evidence.length} cited records · ${loop.SOURCE_SYSTEM}`,
    labels: pack.actions.map((a) => a.label),
    help: pack.actions.map((a) => a.help),
    outputs: pack.actions.map((a) => a.output),
  };
  return { quest, copy, sources: loop.evidence.length };
}

async function scan(req, res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });
  const ac = new AbortController();
  req.on('close', () => ac.abort());
  let seq = 0;
  const send = (event, data) =>
    !ac.signal.aborted &&
    res.write(`id: ${++seq}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  try {
    if (!cortex && !claude)
      throw Error('No Claude route: connect Snowflake (Cortex) or set ANTHROPIC_API_KEY');
    send('status', { text: `Reading ${sf ? 'Snowflake' : 'demo'} evidence` });
    const found = await loadEvidence();
    found.forEach((l) => loops.set(l.LOOP_ID, l));
    // Learn from picks: the last accepted actions, read back from the journal, steer the next cards.
    let picks = '';
    if (sf) {
      const { rows } = await runStatement(
        sf,
        "SELECT LOOP_ID, DETAIL:action::STRING AS ACTION FROM LOOP_JOURNAL WHERE EVENT = 'accepted_job' AND DETAIL:action IS NOT NULL ORDER BY AT DESC LIMIT 6",
      ).catch(() => ({ rows: [] }));
      picks = rows.map((r) => `- ${r.LOOP_ID}: ${r.ACTION}`).join('\n');
      if (rows.length)
        send('status', { text: `${rows.length} past picks loaded from LOOP_JOURNAL` });
    }
    send('status', {
      text: `${found.length} open loops found · asking ${cortex ? 'Claude in Snowflake Cortex' : 'Claude'}`,
    });
    let ready = 0,
      failed = 0;
    await Promise.all(
      found.map(async (loop) => {
        try {
          const { pack, usage: u, model } = await makePack(loop, ac.signal, picks);
          track(u);
          remember(loop.LOOP_ID, 'card_pack', model, pack);
          ready++;
          send('quest', {
            ...toQuest(loop, pack, model),
            text: `${loop.LOOP_ID} card ready · ${ready} of ${found.length}`,
          });
        } catch (err) {
          failed++;
          if (!ac.signal.aborted)
            send('status', { text: `${loop.LOOP_ID} skipped: ${err.message.slice(0, 120)}` });
        }
      }),
    );
    send('done', {
      status: ready ? (failed ? 'partial' : 'complete') : 'failed',
      text: ready ? `Scan complete · ${ready} cards` : 'Scan failed · no cards',
    });
  } catch (err) {
    send('done', { status: 'failed', text: err.message.slice(0, 160) });
  }
  res.end();
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 16e3) throw Error('Request too large');
  }
  return JSON.parse(raw || '{}');
}

async function run(req, res) {
  try {
    const { record, brief, action } = await body(req);
    const loop = loops.get(record);
    if (!loop) throw Error('Unknown loop; run a scan first');
    if (typeof brief !== 'string' || !brief.trim() || brief.length > 900)
      throw Error('Invalid brief');
    const out = await makeJob(loop, brief);
    track(out.usage);
    remember(record, 'accepted_job', out.model, {
      action: typeof action === 'string' ? action.slice(0, 120) : null,
      brief,
      result: out.text,
      usage: out.usage,
    });
    json(res, 200, { text: out.text, model: out.model, usage: out.usage });
  } catch (err) {
    json(res, 400, { error: err.message.slice(0, 200) });
  }
}

const JOURNAL_VIEW =
  "SELECT TO_VARCHAR(AT, 'HH24:MI:SS') AS AT, LOOP_ID, EVENT, MODEL, LEFT(COALESCE(DETAIL:headline::STRING, DETAIL:action::STRING, 'returns ' || DETAIL:due_at::STRING, TO_VARCHAR(DETAIL)), 90) AS DETAIL FROM LOOP_JOURNAL ORDER BY AT DESC LIMIT 14";
let journalCache = { at: 0, rows: [] };
async function backend(res) {
  if (sf && Date.now() - journalCache.at > 2500) {
    journalCache.at = Date.now();
    try {
      journalCache.rows = (await runStatement(sf, JOURNAL_VIEW)).rows;
    } catch (err) {
      journalCache.error = err.message.slice(0, 160);
    }
  }
  json(res, 200, {
    evidence: evidenceLabel,
    model: modelLabel,
    snowflake: Boolean(sf),
    // The viewer's own journal polling is hidden so it doesn't flood the log.
    queries: queryLog.filter((q) => !q.statement.startsWith("SELECT TO_VARCHAR(AT, 'HH24")),
    journal: journalCache.rows,
    journaled,
  });
}

async function snooze(req, res) {
  try {
    const { record, dueAt } = await body(req);
    if (!loops.has(record) || Number.isNaN(Date.parse(dueAt))) throw Error('Invalid snooze');
    remember(record, 'snoozed', null, { due_at: dueAt });
    json(res, 200, { ok: true, journaled: Boolean(sf) });
  } catch (err) {
    json(res, 400, { error: err.message.slice(0, 200) });
  }
}

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function serveStatic(req, res, path) {
  if (path === '/') path = '/open-loops.html';
  const file = normalize(join(previews, decodeURIComponent(path)));
  if (!file.startsWith(previews)) return json(res, 403, { error: 'forbidden' });
  try {
    let data = await readFile(file);
    if (path === '/open-loops.html') {
      const live = JSON.stringify({ evidence: evidenceLabel, model: modelLabel });
      data = data
        .toString()
        .replace(
          '<script src="assets/open-loops.js">',
          `<script>window.OPEN_LOOPS_LIVE=${live}</script><script src="assets/open-loops.js">`,
        );
    }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    json(res, 404, { error: 'not found' });
  }
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/api/scan' && req.method === 'GET') return scan(req, res);
  if (pathname === '/api/run' && req.method === 'POST') return run(req, res);
  if (pathname === '/api/snooze' && req.method === 'POST') return snooze(req, res);
  if (pathname === '/api/backend') return backend(res);
  if (pathname === '/backend') return serveStatic(req, res, '/backend.html');
  if (pathname === '/api/status')
    return json(res, 200, {
      evidence: evidenceLabel,
      model: modelLabel,
      snowflake: Boolean(sf),
      usage,
      journaled,
    });
  if (req.method === 'GET') return serveStatic(req, res, pathname);
  json(res, 405, { error: 'method not allowed' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Open Loops live on http://127.0.0.1:${port}/`);
  console.log(`  evidence: ${evidenceLabel}`);
  console.log(
    `  claude:   ${cortex ? modelLabel : claude ? `${claude.model} via ${claude.base}` : 'missing credential'}`,
  );
});
