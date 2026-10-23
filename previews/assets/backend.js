// Live view of what the server does in Snowflake: every SQL API statement and the journal table.
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const kind = (q) =>
    q.status === 'error'
      ? ['error', 'error']
      : q.statement.includes('AI_COMPLETE')
        ? ['cortex', 'Cortex AI_COMPLETE · Claude']
        : q.statement.startsWith('INSERT')
          ? ['', 'Journal write']
          : q.statement.includes('LOOP_EVIDENCE')
            ? ['', 'Evidence read']
            : ['', 'Query'];
  const seen = new Set();
  async function tick() {
    try {
      const d = await (await fetch('/api/backend')).json();
      $('evidence').innerHTML = `Evidence <b>${esc(d.evidence)}</b>`;
      $('model').innerHTML = `Model <b>${esc(d.model)}</b>`;
      $('writes').innerHTML =
        `Journal writes <b>${d.journaled.ok}</b> ok · ${d.journaled.failed} failed`;
      if (d.queries.length)
        $('queries').innerHTML = d.queries
          .slice(0, 12)
          .map((q) => {
            const [cls, label] = kind(q),
              key = q.at + q.statement;
            const fresh = !seen.has(key);
            seen.add(key);
            return `<li${fresh ? '' : ' style="animation:none"'}><div class="meta"><span class="tag ${cls}">${label}</span><span>${q.at.slice(11, 19)}</span><span>${q.status === 'running' ? 'running…' : `${q.ms} ms`}</span>${q.rows != null ? `<span>${q.rows} rows</span>` : ''}</div><code>${esc(q.statement)}</code>${q.error ? `<div class="meta">${esc(q.error)}</div>` : ''}</li>`;
          })
          .join('');
      $('journal').innerHTML = d.journal.length
        ? d.journal
            .map(
              (r) =>
                `<tr><td>${esc(r.AT)}</td><td>${esc(r.LOOP_ID)}</td><td class="ev">${esc(r.EVENT)}</td><td class="detail">${esc(r.DETAIL)}</td></tr>`,
            )
            .join('')
        : `<tr><td colspan="4" class="empty">${d.snowflake ? 'Empty' : 'Snowflake not connected'}</td></tr>`;
    } catch {
      $('evidence').textContent = 'Server unreachable';
    }
  }
  tick();
  setInterval(tick, 1200);
})();
