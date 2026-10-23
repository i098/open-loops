// Claude Messages API: complete card packs (forced tool call, validated) and
// explicitly accepted read/draft jobs. Works against api.anthropic.com or any
// Anthropic-compatible endpoint (Snowflake Cortex AI Gateway) via ANTHROPIC_BASE_URL.

export function claudeConfig(env = process.env) {
  const key = env.ANTHROPIC_API_KEY || env.CORTEX_GATEWAY_PAT;
  if (!key) return null;
  return {
    base: (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, ''),
    key,
    bearer: Boolean(env.CORTEX_GATEWAY_PAT && !env.ANTHROPIC_API_KEY),
    model: env.OPEN_LOOPS_MODEL || 'claude-sonnet-5-5',
  };
}

async function messages(cfg, body, { fetchImpl = fetch, signal } = {}) {
  const headers = { 'content-type': 'application/json', 'anthropic-version': '2023-06-01' };
  if (cfg.bearer) headers.authorization = `Bearer ${cfg.key}`;
  else headers['x-api-key'] = cfg.key;
  const res = await fetchImpl(`${cfg.base}/v1/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: cfg.model, ...body }),
    signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw Error(`Claude request failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res.json();
}

const PACK_TOOL = {
  name: 'emit_card_pack',
  description: 'Emit one complete decision card for an open loop, citing only supplied evidence.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['headline', 'body', 'short', 'why', 'quote', 'quote_evidence_id', 'actions'],
    properties: {
      headline: {
        type: 'string',
        description: 'Two short lines separated by \\n, at most 48 characters total, plain words.',
      },
      body: {
        type: 'string',
        description: 'One sentence under 70 characters: why it matters now.',
      },
      short: { type: 'string', description: 'Two or three word label.' },
      why: { type: 'string', description: 'One sentence on the decision the owner must make.' },
      quote: { type: 'string', description: 'An exact substring copied from one evidence text.' },
      quote_evidence_id: {
        type: 'string',
        description: 'The evidence id the quote comes from, e.g. REQ-184#c3 (the text after [n]).',
      },
      actions: {
        type: 'array',
        minItems: 2,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'help', 'output', 'brief'],
          properties: {
            label: { type: 'string', description: 'Imperative, under 34 characters.' },
            help: { type: 'string', description: 'Under 45 characters; say what is NOT done.' },
            output: {
              type: 'string',
              description: 'What comes back, e.g. "One draft reply to Leo".',
            },
            brief: {
              type: 'string',
              description:
                'Exact brief for a read/draft-only agent. Must forbid sending, approving or changing records.',
            },
          },
        },
      },
    },
  },
};

const SYSTEM = `You turn office open loops into one decision card each.
Rules: use only the supplied evidence; never invent people, dates, amounts or status.
Every action is read or draft only: summarize, recommend, or draft a message. Never send, approve, pay, close, revoke or change anything.
Write for a busy owner: concrete, short, no filler.`;

function evidenceBlock(loop) {
  return [
    `Loop ${loop.LOOP_ID} (${loop.KIND}) in ${loop.SOURCE_SYSTEM}: ${loop.TITLE}`,
    `Owner: ${loop.OWNER}. Counterpart: ${loop.COUNTERPART}. Status: ${loop.STATUS}. Created: ${loop.CREATED_AT}.`,
    ...loop.evidence.map((e, i) => `[${i + 1}] ${e.id} at ${e.at}: ${e.text}`),
  ].join('\n');
}

export function validatePack(loop, pack) {
  const fail = (m) => {
    throw Error(`Invalid card pack for ${loop.LOOP_ID}: ${m}`);
  };
  for (const k of ['headline', 'body', 'short', 'why', 'quote', 'quote_evidence_id'])
    if (typeof pack[k] !== 'string' || !pack[k].trim()) fail(`missing ${k}`);
  const ref = pack.quote_evidence_id.replace(/[[\]\s]/g, '');
  const cited = loop.evidence.find((e, i) => e.id === ref || String(i + 1) === ref);
  if (!cited) fail(`quote cites unknown evidence ${pack.quote_evidence_id}`);
  const norm = (s) => s.replace(/[“”"]/g, '').replace(/[‘’]/g, "'").trim();
  if (!norm(cited.text).includes(norm(pack.quote))) fail('quote is not verbatim evidence');
  pack.quote_evidence_id = cited.id;
  if (!Array.isArray(pack.actions) || pack.actions.length < 2 || pack.actions.length > 3)
    fail('needs 2-3 actions');
  for (const a of pack.actions)
    for (const k of ['label', 'help', 'output', 'brief'])
      if (typeof a[k] !== 'string' || !a[k].trim()) fail(`action missing ${k}`);
  return pack;
}

export async function cardPack(cfg, loop, opts) {
  const out = await messages(
    cfg,
    {
      max_tokens: 1200,
      system: SYSTEM,
      tools: [PACK_TOOL],
      // Newer Claude models reject forced tool_choice; 'auto' plus an explicit instruction
      // still yields one validated tool call. https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
      tool_choice: { type: 'auto' },
      messages: [
        {
          role: 'user',
          content: `${evidenceBlock(loop)}\n\nCall emit_card_pack exactly once. Do not reply with text.`,
        },
      ],
    },
    opts,
  );
  const call = out.content?.find((c) => c.type === 'tool_use' && c.name === PACK_TOOL.name);
  if (!call || out.stop_reason === 'max_tokens')
    throw Error(`No complete card pack for ${loop.LOOP_ID}`);
  const pack = validatePack(loop, call.input);
  pack.headline = pack.headline.replace(/\\n/g, '\n');
  return { pack, usage: out.usage, model: out.model };
}

export async function runJob(cfg, loop, brief, opts) {
  const out = await messages(
    cfg,
    {
      max_tokens: 700,
      system: `${SYSTEM}
You are executing one accepted read/draft task. Return only the result as plain text (no markdown, no headings, no preamble), under 90 words.
Cite evidence inline as [1], [2]. If a draft message is requested, write it ready to paste; it will not be sent.`,
      messages: [{ role: 'user', content: `${evidenceBlock(loop)}\n\nTask brief:\n${brief}` }],
    },
    opts,
  );
  const text = (out.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim();
  if (!text) throw Error('Claude returned no result text');
  return { text, usage: out.usage, model: out.model };
}
