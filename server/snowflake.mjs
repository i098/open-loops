// Snowflake SQL API v2 client: one fixed, bound read query. No model-written SQL.
// https://docs.snowflake.com/en/developer-guide/sql-api/reference

export const EVIDENCE_COLUMNS = [
  'LOOP_ID',
  'KIND',
  'TITLE',
  'OWNER',
  'COUNTERPART',
  'SOURCE_SYSTEM',
  'STATUS',
  'CREATED_AT',
  'EVIDENCE_ID',
  'EVIDENCE_AT',
  'EVIDENCE_TEXT',
];

export function snowflakeConfig(env = process.env) {
  const account = env.SNOWFLAKE_ACCOUNT,
    token = env.SNOWFLAKE_PAT;
  if (!account || !token) return null;
  return {
    origin: env.SNOWFLAKE_ORIGIN || `https://${account}.snowflakecomputing.com`,
    token,
    database: env.SNOWFLAKE_DATABASE || 'OPEN_LOOPS',
    schema: env.SNOWFLAKE_SCHEMA || 'PUBLIC',
    warehouse: env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
    role: env.SNOWFLAKE_ROLE,
    view: env.SNOWFLAKE_EVIDENCE_VIEW || 'LOOP_EVIDENCE',
    owner: env.OPEN_LOOPS_OWNER || 'Alex Rivera',
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Every statement this process runs, newest first, for the /backend view.
export const queryLog = [];

export async function runStatement(cfg, statement, bindings, opts = {}) {
  const entry = {
    at: new Date().toISOString(),
    statement: statement.replace(/\s+/g, ' ').slice(0, 220),
    status: 'running',
  };
  queryLog.unshift(entry);
  queryLog.length = Math.min(queryLog.length, 60);
  const t = Date.now();
  try {
    const out = await runStatementRaw(cfg, statement, bindings, opts);
    Object.assign(entry, { status: 'ok', ms: Date.now() - t, rows: out.rows.length });
    return out;
  } catch (err) {
    Object.assign(entry, { status: 'error', ms: Date.now() - t, error: err.message.slice(0, 160) });
    throw err;
  }
}

async function runStatementRaw(
  cfg,
  statement,
  bindings,
  { fetchImpl = fetch, signal, pollMs = 500 } = {},
) {
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    'X-Snowflake-Authorization-Token-Type': 'PROGRAMMATIC_ACCESS_TOKEN',
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'open-loops/0.2',
  };
  const body = {
    statement,
    bindings,
    timeout: 60,
    database: cfg.database,
    schema: cfg.schema,
    warehouse: cfg.warehouse,
    ...(cfg.role ? { role: cfg.role } : {}),
  };
  const call = async (url, init) => {
    const res = await fetchImpl(url, { ...init, headers, signal });
    if (res.status === 401 || res.status === 403)
      throw Object.assign(Error(`Snowflake denied access (${res.status})`), { code: 'auth' });
    if (res.status === 429)
      throw Object.assign(Error('Snowflake rate limited the query (429)'), { code: 'rate' });
    if (res.status >= 400) {
      const detail = await res.text().catch(() => '');
      throw Error(`Snowflake error ${res.status}: ${detail.slice(0, 200)}`);
    }
    return { status: res.status, json: await res.json() };
  };
  let { status, json } = await call(`${cfg.origin}/api/v2/statements`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const handle = json.statementHandle;
  for (let i = 0; status === 202; i++) {
    if (i > 120) throw Error('Snowflake query did not finish in time');
    await sleep(pollMs);
    ({ status, json } = await call(`${cfg.origin}/api/v2/statements/${handle}`, { method: 'GET' }));
  }
  const meta = json.resultSetMetaData;
  const names = meta.rowType.map((c) => c.name.toUpperCase());
  let data = json.data || [];
  const partitions = meta.partitionInfo?.length || 1;
  for (let p = 1; p < partitions; p++) {
    const part = await call(`${cfg.origin}/api/v2/statements/${handle}?partition=${p}`, {
      method: 'GET',
    });
    data = data.concat(part.json.data || []);
  }
  return { names, rows: data.map((row) => Object.fromEntries(names.map((n, i) => [n, row[i]]))) };
}

// Fixed, bound read. https://docs.snowflake.com/en/developer-guide/sql-api/submitting-requests#using-bind-variables-in-a-statement
export async function fetchEvidence(cfg, opts) {
  if (!/^[A-Z0-9_]+$/i.test(cfg.view)) throw Error('Invalid evidence view name');
  const { names, rows } = await runStatement(
    cfg,
    `SELECT ${EVIDENCE_COLUMNS.map((c) => (c.endsWith('_AT') ? `TO_VARCHAR(${c}, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM') AS ${c}` : c)).join(', ')} FROM ${cfg.view} WHERE OWNER = ? ORDER BY CREATED_AT, LOOP_ID, EVIDENCE_AT LIMIT 200`,
    { 1: { type: 'TEXT', value: cfg.owner } },
    opts,
  );
  for (const col of EVIDENCE_COLUMNS)
    if (!names.includes(col)) throw Error(`Evidence view is missing column ${col}`);
  return rows;
}

// Memory: append what Claude produced and what the user accepted to LOOP_JOURNAL.
export async function journal(cfg, loopId, event, model, detail, opts) {
  await runStatement(
    cfg,
    'INSERT INTO LOOP_JOURNAL (LOOP_ID, EVENT, MODEL, DETAIL) SELECT ?, ?, ?, PARSE_JSON(?)',
    {
      1: { type: 'TEXT', value: loopId },
      2: { type: 'TEXT', value: event },
      3: { type: 'TEXT', value: model },
      4: { type: 'TEXT', value: JSON.stringify(detail) },
    },
    opts,
  );
}

export function groupLoops(rows) {
  const loops = new Map();
  for (const r of rows) {
    if (!loops.has(r.LOOP_ID)) loops.set(r.LOOP_ID, { ...r, evidence: [] });
    loops
      .get(r.LOOP_ID)
      .evidence.push({ id: r.EVIDENCE_ID, at: r.EVIDENCE_AT, text: r.EVIDENCE_TEXT });
  }
  return [...loops.values()];
}
