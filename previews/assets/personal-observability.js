(() => {
  const day = '2026-10-22',
    stamp = (t) => `${day}T${t}Z`;
  // Entirely synthetic fixtures. These are not collected from the workstation.
  const events = [
    {
      id: 'context-notes',
      time: '09:00:00',
      type: 'context',
      title: 'Notes became the frontmost app',
      summary:
        'The example context snapshot names Notes and its Launch brief window. It does not establish attention, reading or work duration.',
      source: 'Example AX snapshot',
      ref: 'CTX-01',
      evidence: 'frontmost_app: Notes; window_title: Launch brief; captured_at: 09:00:00 UTC',
      limit:
        'One app-context snapshot. No keystrokes, screen recording or actual Accessibility access.',
      state: 'Context observed',
    },
    {
      id: 'question-laptop',
      time: '09:04:00',
      type: 'quest',
      title: 'Question submitted: the duplicate laptop request',
      summary:
        'A question was recorded about REQ-184. This starts the decision-time clock, before evidence review.',
      source: 'Example question journal',
      ref: 'Q-01',
      quest: 'laptop',
      phase: 'question',
      evidence: 'question_id: Q-01; quest_id: laptop; submitted_at: 09:04:00 UTC',
      limit: 'A question is not acceptance or permission to change a source.',
      state: 'Question submitted',
    },
    {
      id: 'accept-laptop',
      time: '09:05:12',
      type: 'quest',
      title: 'Accepted: prepare a closure recommendation',
      summary:
        'The person explicitly accepted one read-and-draft task. This credited 10 XP; it did not close the request.',
      source: 'Example acceptance journal',
      ref: 'ACCEPT-01',
      quest: 'laptop',
      job: 'J-01',
      phase: 'accepted',
      evidence:
        'quest_id: laptop; job_id: J-01; allowed: read supplied REQ-184 / REQ-221 excerpts, draft recommendation; writes: none',
      limit: 'Acceptance and source approval are separate decisions.',
      state: 'Accepted · +10 XP',
    },
    {
      id: 'agent-laptop',
      time: '09:06:20',
      type: 'agent',
      title: 'Closure recommendation prepared',
      summary:
        'The example agent returned a draft recommendation. The source remained unchanged at this point.',
      source: 'Example agent result',
      ref: 'J-01',
      job: 'J-01',
      quest: 'laptop',
      phase: 'completed',
      evidence:
        'Recommend duplicate closure only after checking current status and permission. REQ-221 is marked fulfilled; Maya identifies REQ-184 as a duplicate.',
      limit: 'A result-ready event completes the agent job, not the business request.',
      state: 'Prepared · not executed',
    },
    {
      id: 'approve-laptop',
      time: '09:09:00',
      type: 'source',
      title: 'Separate approval: close REQ-184',
      summary:
        'The example person approved an exact source action after reviewing the prepared recommendation.',
      source: 'Example source-action journal',
      ref: 'APPROVAL-01',
      quest: 'laptop',
      phase: 'approved',
      evidence:
        'target: REQ-184; action: Close as duplicate of REQ-221; expected_version: 42; actor_permission: allowed',
      limit: 'Approval alone is not proof that the write succeeded.',
      state: 'Source action approved',
    },
    {
      id: 'verify-laptop',
      time: '09:10:30',
      type: 'source',
      title: 'REQ-184 closure confirmed by source readback',
      summary:
        'The synthetic source receipt confirms a transition from open to closed. This is the one verified stale closure in the example day.',
      source: 'Example Jira readback',
      ref: 'RECEIPT-01',
      quest: 'laptop',
      phase: 'verified',
      previousStatus: 'open',
      status: 'closed',
      openedAt: '2026-07-10T09:00:00Z',
      evidence:
        'REQ-184 · version 42 → 43 · open → closed\nResolution: duplicate of REQ-221\nWrite acknowledged; authoritative fixture readback matches approved payload.',
      limit: 'Synthetic receipt, not a live source action. No actual request was changed.',
      state: 'Verified · fixture receipt',
    },
    {
      id: 'context-jira',
      time: '10:07:00',
      type: 'context',
      title: 'Jira became the frontmost app',
      summary:
        'The example records an app-context change to Jira. The event alone says nothing about attention or activity between snapshots.',
      source: 'Example AX snapshot',
      ref: 'CTX-02',
      evidence: 'frontmost_app: Jira; window_title: Service requests; captured_at: 10:07:00 UTC',
      limit: 'No inferred focus time, productivity score or continuous monitoring.',
      state: 'Context observed',
    },
    {
      id: 'question-leo',
      time: '10:15:00',
      type: 'quest',
      title: 'Question submitted: follow up with Leo',
      summary: 'The question asks for a draft update without inventing a rollout date.',
      source: 'Example question journal',
      ref: 'Q-02',
      quest: 'leo',
      phase: 'question',
      evidence: 'question_id: Q-02; quest_id: leo; submitted_at: 10:15:00 UTC',
      limit: 'The saved thread may be stale; absence of a reply is not proof none was sent.',
      state: 'Question submitted',
    },
    {
      id: 'accept-leo',
      time: '10:17:24',
      type: 'quest',
      title: 'Accepted: draft a reply to Leo',
      summary:
        'One draft-only task was accepted. Its decision time includes 2 minutes 24 seconds from question submission.',
      source: 'Example acceptance journal',
      ref: 'ACCEPT-02',
      quest: 'leo',
      job: 'J-02',
      phase: 'accepted',
      evidence:
        'quest_id: leo; job_id: J-02; allowed: use supplied Thread 17, prepare reply; prohibited: invented dates, sending',
      limit: '10 XP rewards the explicit acceptance, not sending a message.',
      state: 'Accepted · +10 XP',
    },
    {
      id: 'agent-leo',
      time: '10:18:00',
      type: 'agent',
      title: 'A reply to Leo is ready for review',
      summary:
        'A draft was prepared. There is no send approval or delivery receipt for it in the example day.',
      source: 'Example agent result',
      ref: 'J-02',
      job: 'J-02',
      quest: 'leo',
      phase: 'completed',
      evidence:
        'Hi Leo, following up on the rollout timeline I promised. I’m confirming the dates and will send a concrete update once they are verified.',
      limit: 'Draft only. Nothing was sent.',
      state: 'Prepared · not sent',
    },
    {
      id: 'context-browser',
      time: '11:18:00',
      type: 'context',
      title: 'Safari became the frontmost app',
      summary:
        'A single context event names a Roadmap window. It cannot establish what the person read or how long they worked.',
      source: 'Example AX snapshot',
      ref: 'CTX-03',
      evidence: 'frontmost_app: Safari; window_title: Roadmap; captured_at: 11:18:00 UTC',
      limit: 'No browsing history, URL collection or real window inspection.',
      state: 'Context observed',
    },
    {
      id: 'question-launch',
      time: '14:00:00',
      type: 'quest',
      title: 'Question submitted: review the launch brief',
      summary: 'The example question asks what still needs review in APR-42.',
      source: 'Example question journal',
      ref: 'Q-03',
      quest: 'launch',
      phase: 'question',
      evidence: 'question_id: Q-03; quest_id: launch; submitted_at: 14:00:00 UTC',
      limit: 'A pending approval is not evidence that the person has signed off.',
      state: 'Question submitted',
    },
    {
      id: 'accept-launch',
      time: '14:00:36',
      type: 'quest',
      title: 'Accepted: summarize the approval context',
      summary:
        'The read-only summary task was accepted, crediting 10 XP. The later failure does not erase this acceptance.',
      source: 'Example acceptance journal',
      ref: 'ACCEPT-03',
      quest: 'launch',
      job: 'J-03',
      phase: 'accepted',
      evidence:
        'quest_id: launch; job_id: J-03; allowed: summarize supplied APR-42 history; prohibited: approve or launch',
      limit: 'Acceptance does not imply a successful agent result.',
      state: 'Accepted · +10 XP',
    },
    {
      id: 'failed-launch',
      time: '14:01:02',
      type: 'agent',
      title: 'The launch summary could not be prepared',
      summary:
        'The example job stopped because a required brief excerpt was unavailable. No approval or source action occurred.',
      source: 'Example agent failure',
      ref: 'J-03',
      job: 'J-03',
      quest: 'launch',
      phase: 'failed',
      evidence: 'result: unavailable; reason: missing current brief excerpt; source_changes: none',
      limit: 'This job is excluded from completed-job totals. The 10 acceptance XP remains.',
      state: 'Failed · missing evidence',
    },
  ];
  const memories = [
    {
      id: 'memory-closure',
      time: '09:11:00',
      type: 'observed',
      title: 'The duplicate request has a closure receipt',
      summary: 'REQ-184 was closed as a duplicate of REQ-221 in the example source readback.',
      sources: ['verify-laptop'],
      evidence:
        'Saved summary of RECEIPT-01, version 43. Request status: closed. Resolution: duplicate.',
      limit:
        'A summary is not current source truth. Refresh the authoritative record before a later action.',
    },
    {
      id: 'memory-draft',
      time: '10:19:00',
      type: 'observed',
      title: 'Leo’s update is still a draft',
      summary:
        'A reply was prepared without rollout dates. The record has no send approval or delivery receipt.',
      sources: ['agent-leo'],
      evidence:
        'Saved from J-02: draft prepared. No message-send event is present in this example journal.',
      limit:
        'Absence of a send event in this journal does not prove no message was sent elsewhere.',
    },
    {
      id: 'memory-topic',
      time: '11:20:00',
      type: 'inferred',
      title: 'Possible topic: launch planning',
      summary:
        'The example memory suggests a topic from the Launch brief and Roadmap window labels. This is an inference, not observed attention.',
      sources: ['context-notes', 'context-browser'],
      evidence:
        'Signals: Notes window “Launch brief”; Safari window “Roadmap”. No document contents were used.',
      limit:
        'Window labels can be ambiguous. Do not treat this inferred topic as a fact about the person’s intent or work.',
    },
  ];
  const byId = new Map(events.map((e) => [e.id, e]));
  const unique = (xs, key) => new Set(xs.map((x) => x[key])).size;
  const accepted = events.filter((e) => e.phase === 'accepted'),
    completed = events.filter((e) => e.phase === 'completed');
  const verified = events.filter(
    (e) => e.phase === 'verified' && e.previousStatus === 'open' && e.status === 'closed',
  );
  const stale = verified.filter(
    (e) => (Date.parse(stamp(e.time)) - Date.parse(e.openedAt)) / 86400000 >= 30,
  );
  const durations = accepted
    .flatMap((a) => {
      const q = events.find((e) => e.phase === 'question' && e.quest === a.quest);
      return q ? [Date.parse(stamp(a.time)) - Date.parse(stamp(q.time))] : [];
    })
    .sort((a, b) => a - b);
  const median =
    durations.length % 2
      ? durations[(durations.length - 1) / 2]
      : (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2;
  const seconds = Math.round(median / 1000),
    fmtDuration = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  document.getElementById('accepted-total').textContent = unique(accepted, 'quest');
  document.getElementById('xp-label').textContent = `${unique(accepted, 'quest') * 10} XP`;
  document.getElementById('prepared-total').textContent = unique(completed, 'job');
  document.getElementById('prepared-note').textContent =
    `${unique(completed, 'job')} drafts · not source changes`;
  document.getElementById('verified-total').textContent = unique(verified, 'quest');
  document.getElementById('stale-note').textContent =
    `${unique(stale, 'quest')} stale request · fixture receipt`;
  document.getElementById('decision-total').textContent = fmtDuration;
  document.getElementById('decision-note').textContent =
    `${durations.length} matched decisions · includes waiting`;
  document.getElementById('event-count').textContent = events.length;
  document.getElementById('memory-count').textContent = memories.length;
  let view = 'timeline',
    filter = 'all',
    selected = 'verify-laptop';
  const list = document.getElementById('record-list'),
    inspector = document.getElementById('inspector'),
    announce = document.getElementById('announcement');
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const label = { context: 'App context', quest: 'Quest', agent: 'Agent', source: 'Source' };
  const rows = () =>
    view === 'memory' ? memories : events.filter((e) => filter === 'all' || e.type === filter);
  function renderList() {
    const data = rows();
    if (!data.some((e) => e.id === selected)) selected = data[0]?.id || null;
    list.setAttribute(
      'aria-label',
      view === 'memory' ? 'Saved memory summaries' : 'Chronological events',
    );
    list.innerHTML = data.length
      ? data
          .map(
            (e) =>
              `<li><button class="entry ${view === 'memory' ? 'memory-entry' : ''}" data-record="${e.id}" aria-pressed="${e.id === selected}" aria-controls="inspector"><time datetime="${stamp(e.time)}">${e.time.slice(0, 5)}</time><span class="entry-dot ${e.phase === 'accepted' || e.phase === 'verified' ? 'solid' : ''}" aria-hidden="true"></span><span class="entry-main"><span class="entry-title">${esc(e.title)}</span><span class="entry-meta">${view === 'memory' ? `<span>${e.type === 'inferred' ? 'Inferred topic' : 'Observed summary'}</span><span>${e.sources.length} ${e.sources.length === 1 ? 'source' : 'sources'}</span>` : `<span>${label[e.type]}</span><span class="state ${e.phase === 'failed' ? 'failed' : ''}">${esc(e.state)}</span>`}</span></span></button></li>`,
          )
          .join('')
      : '<li class="empty">No records match this filter.</li>';
    document.getElementById('showing').textContent =
      `${data.length} ${view === 'memory' ? 'summaries' : 'events'}`;
    document.querySelector('.filters').hidden = view === 'memory';
    document.getElementById('list-note').textContent =
      view === 'memory'
        ? 'Saved summaries retain their source and timestamp. Inferred topics are kept separate from observed records.'
        : 'App changes record context, not attention or time worked. Select an event to inspect its evidence.';
    renderDetail();
  }
  function renderDetail() {
    const e = rows().find((x) => x.id === selected);
    if (!e) {
      inspector.innerHTML =
        '<h2>No record selected</h2><p class="inspect-summary">Choose another filter.</p>';
      return;
    }
    const memory = view === 'memory';
    inspector.innerHTML = `<div class="inspect-kicker"><span>${memory ? 'Saved memory' : label[e.type]}</span><span class="type-tag ${memory && e.type === 'inferred' ? 'inferred' : ''}">${memory ? (e.type === 'inferred' ? 'Inferred' : 'Observed summary') : 'Observed · fixture'}</span></div><h2>${esc(e.title)}</h2><p class="inspect-summary">${esc(e.summary)}</p><h3 class="evidence-title">${memory ? 'Saved statement' : 'Recorded evidence'}</h3><blockquote class="evidence-quote">${esc(e.evidence).replace(/\n/g, '<br>')}</blockquote><dl class="provenance"><div><dt>${memory ? 'Saved at' : 'Observed at'}</dt><dd>22 Oct 2026 · ${e.time} UTC</dd></div><div><dt>Source</dt><dd>${memory ? 'Example memory fixture' : esc(e.source)}</dd></div><div><dt>Record</dt><dd>${esc(memory ? e.id : e.ref)}</dd></div></dl>${memory ? `<h3 class="evidence-title">Supporting events</h3>${e.sources.map((id) => `<button class="source-button" data-source="${id}">${esc(byId.get(id).ref)} · ${esc(byId.get(id).title)}</button>`).join('')}` : ''}<p class="caveat">${esc(e.limit)}</p>`;
  }
  document.querySelectorAll('[data-filter]').forEach((b) =>
    b.addEventListener('click', () => {
      filter = b.dataset.filter;
      document
        .querySelectorAll('[data-filter]')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderList();
      list.scrollTop = 0;
      announce.textContent = `${rows().length} ${filter === 'all' ? 'total' : filter} events shown.`;
    }),
  );
  function switchView(next) {
    view = next;
    document.querySelectorAll('[data-view]').forEach((b) => {
      const active = b.dataset.view === next;
      b.setAttribute('aria-selected', String(active));
      b.tabIndex = active ? 0 : -1;
    });
    document
      .getElementById('record-panel')
      .setAttribute('aria-labelledby', next === 'memory' ? 'memory-tab' : 'timeline-tab');
    selected = next === 'memory' ? memories[0].id : 'verify-laptop';
    renderList();
    list.scrollTop = 0;
  }
  document.querySelectorAll('[data-view]').forEach((b) => {
    b.addEventListener('click', () => switchView(b.dataset.view));
    b.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const next =
          e.key === 'Home'
            ? 'timeline'
            : e.key === 'End'
              ? 'memory'
              : view === 'timeline'
                ? 'memory'
                : 'timeline';
        switchView(next);
        document.querySelector(`[data-view="${next}"]`).focus();
      }
    });
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-record]');
    if (!b) return;
    selected = b.dataset.record;
    list
      .querySelectorAll('[data-record]')
      .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderDetail();
    if (matchMedia('(max-width:640px)').matches) {
      inspector.focus({ preventScroll: true });
      inspector.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    announce.textContent = `Details: ${rows().find((x) => x.id === selected).title}`;
  });
  inspector.addEventListener('click', (e) => {
    const b = e.target.closest('[data-source]');
    if (!b) return;
    filter = 'all';
    document
      .querySelectorAll('[data-filter]')
      .forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === 'all')));
    switchView('timeline');
    selected = b.dataset.source;
    renderList();
    const target = list.querySelector(`[data-record="${selected}"]`);
    target?.scrollIntoView({ block: 'nearest' });
    target?.focus({ preventScroll: true });
    announce.textContent = 'Supporting event selected.';
  });
  renderList();
})();
