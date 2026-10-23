(() => {
  const items = [
    {
      id: 'request',
      kind: 'Stale request',
      age: '92 days old',
      title: 'That laptop request is still open',
      why: 'Maya says it’s a duplicate. It’s still awaiting approval.',
      person: 'Maya Chen · IT Operations',
      record: 'REQ-184',
      quote:
        '“The laptop arrived under REQ-221. This request is a duplicate; we don’t need another.”',
      cite: '[1] Maya’s comment · REQ-184 · 8 Aug 2026',
      evidence: '[2] REQ-221 · Fulfilled, laptop delivered',
      source:
        'Snowflake fixture, 23 Oct 2026 10:00 UTC. Source: Jira Service Management. Owner: Alex Rivera. Delivery alone is not resolution; the requester comment supports a recommendation.',
      tasks: [
        {
          label: 'Investigate the evidence',
          help: 'Find what supports or blocks closure.',
          brief:
            'Read the supplied REQ-184 and REQ-221 evidence. Summarize the duplicate claim, contradictions and missing checks. Do not contact anyone or change records.',
          result:
            'Maya explicitly calls REQ-184 a duplicate and REQ-221 is marked fulfilled. The current source status and your transition permission still need rechecking. Warehouse evidence alone cannot prove a live closure.',
        },
        {
          label: 'Prepare a closure recommendation',
          help: 'Draft a resolution. Do not close anything.',
          brief:
            'Prepare a duplicate-closure recommendation for REQ-184 using the cited requester comment and REQ-221 fulfillment. List the source checks required before execution. Do not close the request.',
          result:
            'Recommend closing REQ-184 as a duplicate only if the current source record still matches and you have permission. Suggested note: Duplicate of fulfilled REQ-221; requester confirms the laptop arrived and no further request is needed.',
          write: {
            label: 'Review closing the request',
            operation: 'Close · Duplicate',
            target: 'REQ-184 · Jira Service Management',
            note: 'Duplicate of fulfilled REQ-221. Maya confirms the laptop arrived and this request is no longer needed.',
            result: 'Closed · Duplicate',
            warning: 'A real closure may end the approval workflow; reversal is not guaranteed.',
          },
        },
        {
          label: 'Draft a follow-up to Maya',
          help: 'Prepare a question, not a sent message.',
          brief:
            'Draft one concise question asking Maya whether anything remains before closing REQ-184. Do not send it or change request state.',
          result:
            'Hi Maya, your comment says the laptop arrived under REQ-221. Does anything remain before we close this duplicate request?',
          write: {
            label: 'Review posting the draft',
            operation: 'Add requester comment',
            target: 'Maya Chen · REQ-184',
            note: 'Hi Maya, your comment says the laptop arrived under REQ-221. Does anything remain before we close this duplicate request?',
            result: 'Comment present · Request open',
            warning: 'A real comment would notify the requester. This does not close the request.',
          },
        },
      ],
    },
    {
      id: 'approval',
      kind: 'Pending approval',
      age: 'Waiting 4 days',
      title: 'The launch brief needs your sign-off',
      why: 'Three reviewers are ready. Your decision is the last one.',
      person: 'Noah Patel · Product Operations',
      record: 'APR-42',
      quote:
        '“Final copy and dates are ready. Please confirm the handoff brief or flag the change you need.”',
      cite: '[1] Noah’s request · APR-42 · 19 Oct 2026',
      evidence: '[2] Approval history · 3 reviewers marked ready',
      source:
        'Snowflake fixture, 23 Oct 2026 10:00 UTC. Owner: Noah Patel. The current brief still needs your review; this is not evidence that you have approved it.',
      tasks: [
        {
          label: 'Review the approval context',
          help: 'Summarize what needs your attention.',
          brief:
            'Summarize the supplied APR-42 approval history and identify unresolved questions. Do not approve anything or trigger a launch.',
          result:
            'Three fixture reviewers are marked ready; your approval is still pending. The supplied history does not replace reading the current launch brief.',
        },
        {
          label: 'Draft a revision request',
          help: 'Ask Noah to clarify the launch owner.',
          brief:
            'Draft a short revision request asking Noah to name the accountable launch owner. Do not post the comment or change approval state.',
          result:
            'Before I sign off, please name the accountable launch owner in the handoff brief.',
          write: {
            label: 'Review posting the revision request',
            operation: 'Add revision request',
            target: 'Noah Patel · APR-42',
            note: 'Before I sign off, please name the accountable launch owner in the handoff brief.',
            result: 'Revision requested · Approval pending',
            warning: 'This would notify Noah. It is not approval.',
          },
        },
      ],
    },
    {
      id: 'followup',
      kind: 'Missed follow-up',
      age: '6 days ago',
      title: 'Leo is still waiting for a timeline',
      why: 'You promised a follow-up. No reply is in the snapshot.',
      person: 'Leo Torres · Customer Success',
      record: 'Thread 17',
      quote: '“I’ll send you the rollout timeline after Friday’s check-in.”',
      cite: '[1] Your message to Leo · 17 Oct 2026',
      evidence: '[2] Thread snapshot · No later reply recorded',
      source:
        'Snowflake archive fixture, 23 Oct 2026 10:00 UTC. Owner: you. No reply in a snapshot is not proof that no reply was sent; check the current thread.',
      tasks: [
        {
          label: 'Draft the follow-up',
          help: 'No invented dates. No automatic send.',
          brief:
            'Prepare a reply to Leo acknowledging the overdue timeline update. Do not invent rollout dates or send the message. Mark missing dates for human review.',
          result:
            'Hi Leo, following up on the rollout timeline I promised. I’m confirming the dates and will send a concrete update once they are verified.',
          write: {
            label: 'Review sending the draft',
            operation: 'Send follow-up draft',
            target: 'Leo Torres · Thread 17',
            note: 'Hi Leo, following up on the rollout timeline I promised. I’m confirming the dates and will send a concrete update once they are verified.',
            result: 'Simulated message sent',
            warning:
              'A real send is external and may not be reversible. This branch has no email connector.',
          },
        },
        {
          label: 'Check the latest thread context',
          help: 'Look for a reply or an unresolved promise.',
          brief:
            'Review only the supplied Thread 17 fixture. Identify the promise and evidence gaps. Do not access other threads, send messages or assume absence of a reply proves none was sent.',
          result:
            'The supplied snapshot records a promise on 17 October and no later reply. Refresh the authoritative thread before contacting Leo; the archive may be stale.',
        },
      ],
    },
  ];
  const copy = {
    request: {
      headline: 'Laptop arrived.\nRequest still open.',
      body: 'Maya flagged this request as a duplicate.',
      age: '92 days open',
      short: 'Laptop request',
      read: 'REQ-184 + REQ-221 fixture excerpts',
      labels: [
        'Check the duplicate evidence',
        'Draft a closure recommendation',
        'Draft a question for Maya',
      ],
      help: [
        'Read the two supplied records.',
        'Prepare a recommendation. Close nothing.',
        'Write a question. Send nothing.',
      ],
      outputs: [
        'One evidence summary',
        'One closure recommendation',
        'One draft question for Maya',
      ],
    },
    approval: {
      headline: 'The launch brief\nneeds your review.',
      body: 'Three reviewers are ready. Your decision is pending.',
      age: 'Waiting 4 days',
      short: 'Launch brief',
      read: 'APR-42 fixture excerpts',
      labels: ['Summarize the approval context', 'Draft a revision request'],
      help: ['Show what still needs your review.', 'Ask who owns the launch.'],
      outputs: ['One approval summary', 'One draft revision request'],
    },
    followup: {
      headline: 'Leo is waiting\nfor a timeline.',
      body: 'Your saved thread has no later reply.',
      age: '6 days ago',
      short: 'Timeline follow-up',
      read: 'Thread 17 fixture excerpts',
      labels: ['Draft a reply to Leo', 'Check the saved thread'],
      help: ['Use no unverified dates.', 'Find the promise and missing context.'],
      outputs: ['One draft reply to Leo', 'One thread summary'],
    },
  };
  const snoozes = Object.freeze([
    { id: 'hour', label: 'In 1 hour', help: '60 minutes after you choose' },
    { id: 'tomorrow', label: 'Tomorrow morning', help: 'Tomorrow at 09:00 UTC' },
    { id: 'week', label: 'Next week', help: 'In seven days at 09:00 UTC' },
  ]);
  const cardPacks = new Map();
  function prepareCardPacks() {
    const ids = new Set();
    for (const item of items) {
      item.tasks.forEach((entry, index) => {
        entry.actionId = `${item.record}:action:${index + 1}`;
        if (ids.has(entry.actionId) || !entry.brief.trim())
          throw Error('Invalid fixture action pack');
        ids.add(entry.actionId);
        entry.allowedScopes = Object.freeze(['fixture:read', 'draft:prepare']);
        entry.childCard = Object.freeze({
          title: copy[item.id].labels[index],
          help: copy[item.id].help[index],
          read: copy[item.id].read,
          output: copy[item.id].outputs[index],
        });
      });
      const basePrompt = `Review ${item.record} using only these supplied fixture excerpts. Prepare a helpful next step. Do not send messages, modify records, approve requests, or access a screen.`;
      const steeringTask = {
        actionId: `${item.record}:other`,
        brief: basePrompt,
        allowedScopes: Object.freeze(['fixture:read', 'draft:prepare']),
        childCard: {
          title: 'Review adjusted prompt',
          read: copy[item.id].read,
          output: 'Captured direction for review',
        },
        result:
          'Your adjusted prompt was captured in this preview. No live agent was called and nothing was sent or changed.',
      };
      steeringTask.isSteering = true;
      cardPacks.set(
        item.id,
        Object.freeze({
          questId: item.id,
          actionOptions: item.tasks,
          snoozePolicies: snoozes,
          otherId: `${item.record}:other`,
          basePrompt,
          steeringTask,
        }),
      );
    }
  }
  prepareCardPacks();
  function resolveSnooze(index) {
    const policy = snoozes[index],
      date = new Date();
    if (policy.id === 'hour') date.setTime(date.getTime() + 3600000);
    else {
      date.setUTCDate(date.getUTCDate() + (policy.id === 'tomorrow' ? 1 : 7));
      date.setUTCHours(9, 0, 0, 0);
    }
    return {
      ...policy,
      dueAt: date.toISOString(),
      time:
        new Intl.DateTimeFormat('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }).format(date) + ' UTC',
    };
  }
  const panel = document.getElementById('buddy-panel'),
    body = document.getElementById('panel-body'),
    footer = document.getElementById('pocket-actions'),
    toggle = document.getElementById('buddy-toggle');
  const info = document.getElementById('info-card'),
    deck = document.getElementById('deck-component');
  const pill = document.getElementById('need-pill'),
    art = document.getElementById('buddy-art'),
    dock = document.getElementById('buddy-dock');
  const hint = document.getElementById('idle-hint'),
    status = document.getElementById('demo-status'),
    response = document.getElementById('source-result');
  let open = false,
    view = 'setup',
    current = null,
    task = null,
    note = '',
    writeNote = '',
    pendingTimer,
    idleTimer,
    happyTimer,
    greetTimer,
    swipeTimer,
    drag = null,
    transitioning = false,
    hintDismissed = false,
    lastSnooze = null,
    engaged = false;
  let scanStatus = 'not-started',
    scanStarted = 0,
    scanSeq = 0;
  const readyIds = new Set(),
    scanEvents = [],
    scanTimers = [];
  const handled = new Set(),
    accepted = new Set();
  const navigation = [],
    jobs = new Map(),
    sourceActions = new Map();
  const buddyAnchor = { x: Math.max(12, innerWidth / 2 - 64), y: 12 };
  const buddyPose = { ...buddyAnchor };
  let buddyDrag = null,
    suppressBuddyClick = false;
  const esc = (s) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reducedQuery.matches;
  reducedQuery.addEventListener('change', () => {
    if (!reduced()) return;
    clearMotionGhosts();
    [info, deck, art, body.querySelector('#swipe-card')]
      .filter(Boolean)
      .forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
  });
  let keyboardMotion = false;
  document.addEventListener(
    'keydown',
    () => {
      keyboardMotion = true;
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      keyboardMotion = false;
    },
    true,
  );
  const blocked = () =>
    [
      'brief',
      'edit',
      'dispatched',
      'running',
      'write-preview',
      'write-edit',
      'write-pending',
    ].includes(view);
  const soundButton = document.getElementById('sound-toggle');
  let audioContext,
    masterGain,
    soundEnabled = true,
    audioFailed = false;
  function soundIcon(muted) {
    return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 6H4v8h4l5 3V3L8 6Z"/>${muted ? '<path d="m16 7 3 6m0-6-3 6"/>' : '<path d="M16 6c2 2 2 6 0 8"/>'}</svg>`;
  }
  function updateSound() {
    soundButton.innerHTML = soundIcon(!soundEnabled || audioFailed);
    soundButton.setAttribute(
      'aria-label',
      audioFailed ? 'Sound unavailable' : soundEnabled ? 'Mute sounds' : 'Unmute sounds',
    );
    soundButton.title = soundButton.getAttribute('aria-label');
    soundButton.setAttribute('aria-pressed', String(!soundEnabled));
    soundButton.disabled = audioFailed;
  }
  function sound(kind, event) {
    if (!soundEnabled || audioFailed) return;
    try {
      if (!audioContext) {
        if (!event?.isTrusted) return;
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) throw Error('Audio unavailable');
        audioContext = new C();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.65;
        masterGain.connect(audioContext.destination);
      }
      if (audioContext.state !== 'running') {
        if (!event?.isTrusted) return;
        audioContext.resume().catch(() => {
          audioFailed = true;
          updateSound();
        });
      }
      const now = audioContext.currentTime + 0.004,
        notes =
          kind === 'evolve'
            ? [523.25, 659.25, 783.99]
            : kind === 'accept'
              ? [523.25, 659.25]
              : kind === 'tick'
                ? [850]
                : kind === 'drop'
                  ? [310]
                  : [520];
      notes.forEach((hz, i) => {
        const duration = kind === 'tick' ? 0.05 : 0.07,
          at = now + i * (kind === 'evolve' ? 0.055 : 0.07);
        const oscillator = audioContext.createOscillator(),
          gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(hz, at);
        if (['tick', 'drop', 'pop'].includes(kind))
          oscillator.frequency.exponentialRampToValueAtTime(
            kind === 'tick' ? 700 : kind === 'drop' ? 160 : 320,
            at + duration,
          );
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.03, at + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start(at);
        oscillator.stop(at + duration + 0.004);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      audioFailed = true;
      updateSound();
    }
  }
  function spriteStage() {
    return accepted.size >= 3 ? 'guide' : accepted.size >= 2 ? 'scout' : 'pip';
  }
  function renderSprite(pose = 'idle') {
    const stage = spriteStage(),
      xp = accepted.size * 10;
    document.getElementById('sprite-use').setAttribute('href', `#${stage}-${pose}`);
    art.style.setProperty(
      '--sprite-size',
      stage === 'pip' ? '128px' : stage === 'scout' ? '104px' : '96px',
    );
    art.style.setProperty(
      '--sprite-y',
      stage === 'pip' ? '0px' : stage === 'scout' ? '12px' : '16px',
    );
    document.getElementById('evolution-label').textContent =
      stage[0].toUpperCase() + stage.slice(1);
    document.getElementById('demo-xp').textContent =
      stage === 'guide'
        ? `${xp} XP · Guide`
        : `${xp} XP · ${stage === 'pip' ? 'Scout at 20' : 'Guide at 30'}`;
    const target = stage === 'pip' ? 20 : 30;
    document.getElementById('xp-progress').style.transform = `scaleX(${Math.min(1, xp / target)})`;
    document.getElementById('xp-track').setAttribute('aria-valuenow', String(xp));
    document.getElementById('xp-track').setAttribute('aria-valuemax', String(target));
    panel.dataset.xp = String(xp);
  }
  function rewardQuest(event) {
    if (accepted.has(current.id)) return;
    const before = spriteStage();
    accepted.add(current.id);
    engaged = true;
    renderSprite('celebrate');
    const evolved = before !== spriteStage();
    document.getElementById('demo-xp').textContent = evolved
      ? `${spriteStage() === 'scout' ? 'Scout' : 'Guide'} unlocked`
      : '+10 XP · Quest accepted';
    sound(evolved ? 'evolve' : 'accept', event);
    status.textContent = evolved
      ? `${spriteStage()} unlocked. Ten XP for quest acceptance, not completion.`
      : 'Ten XP for accepting this quest. Nothing has been sent or closed.';
    clearTimeout(happyTimer);
    happyTimer = setTimeout(() => renderSprite('idle'), 700);
  }
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (masterGain) {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.setValueAtTime(soundEnabled ? 0.65 : 0, audioContext.currentTime);
    }
    updateSound();
  });
  function updateCount() {
    const n = items.filter((i) => readyIds.has(i.id) && !handled.has(i.id)).length,
      scanning = scanStatus === 'running';
    pill.textContent = n ? String(n) : '';
    pill.classList.toggle('scan-dot', scanning && !n);
    pill.hidden = !n && !scanning;
    toggle.setAttribute(
      'aria-label',
      scanning
        ? n
          ? `Open Open Loops, ${n} quests ready, scan continuing`
          : 'Open Open Loops, scanning, no quests ready'
        : `Open Open Loops, ${n} quests waiting`,
    );
    panel.dataset.scan = scanStatus;
    document.getElementById('scan-progress').hidden = !scanning;
    document.getElementById('xp-track').hidden = scanning;
    const stack = body.querySelector('.card-stack');
    if (stack) stack.dataset.depth = String(Math.max(1, Math.min(3, n)));
    updateInfo();
  }
  function updateInfo() {
    const count = document.getElementById('info-count'),
      age = document.getElementById('info-age');
    count.disabled = scanStatus === 'not-started' || scanStatus === 'skipped';
    count.textContent =
      scanStatus === 'running'
        ? `${readyIds.size} ready`
        : current
          ? `${items.indexOf(current) + 1} of ${readyIds.size}`
          : scanStatus === 'failed'
            ? `${readyIds.size} ready`
            : 'Setup preview';
    age.textContent = current
      ? copy[current.id].age
      : scanStatus === 'running'
        ? 'Scan running'
        : scanStatus === 'failed'
          ? 'Incomplete'
          : scanStatus === 'complete'
            ? 'Scan complete'
            : 'Not connected';
  }
  const button = (label, command, primary = false) =>
    `<button class="button ${primary ? 'primary' : ''}" data-do="${command}">${label}</button>`;
  const title = (t) => `<h2 id="panel-title" tabindex="-1">${t}</h2>`;
  const choice = (n, label, help, attr) =>
    `<button class="choice-row" ${attr}><span class="choice-number">${n}.</span><span><strong class="choice-label">${label}</strong><span class="choice-help">${help}</span></span></button>`;
  const taskIndex = () => current.tasks.indexOf(task);
  const taskLabel = () => task.childCard.title;
  function activityRows(events) {
    return `<ul class="activity-list">${events.map((e) => `<li><time>+${e.seconds}s</time><span>${e.text}</span></li>`).join('')}</ul>`;
  }
  function publishScan(text, id = null, terminal = null) {
    if (id && !cardPacks.has(id)) throw Error('Quest must have a complete prepared card pack');
    const previous = readyIds.size;
    if (id) readyIds.add(id);
    if (terminal) scanStatus = terminal;
    scanEvents.push({
      seq: ++scanSeq,
      seconds: ((performance.now() - scanStarted) / 1000).toFixed(1),
      text,
    });
    updateCount();
    if (view === 'activity') {
      render('activity', false);
    } else if (view === 'deck' && !current) {
      render('deck', false);
    } else {
      const meta = document.getElementById('scan-meta');
      if (meta)
        meta.textContent =
          scanStatus === 'running'
            ? `${readyIds.size} ready · Scan running`
            : 'Sample scan complete';
    }
    if (previous === 0 && readyIds.size === 1)
      status.textContent =
        'Your first sample quest is ready. More sample sources are still being checked.';
    if (terminal)
      status.textContent =
        terminal === 'complete'
          ? 'Sample scan complete.'
          : `${readyIds.size} quests ready. Sample scan incomplete.`;
  }
  function startScan() {
    scanTimers.splice(0).forEach(clearTimeout);
    scanStatus = 'running';
    scanStarted = performance.now();
    render('activity');
    publishScan('Sample scan started');
    const mode = document.getElementById('setup-outcome').value;
    if (mode === 'failure') {
      scanTimers.push(
        setTimeout(
          () => publishScan('Sample source unavailable: permission denied', null, 'failed'),
          1000,
        ),
      );
      return;
    }
    scanTimers.push(
      setTimeout(
        () =>
          publishScan(
            mode === 'empty' ? 'Sample batch reviewed · 0 quests' : 'Sample REQ-184 reviewed',
          ),
        1000,
      ),
    );
    if (mode !== 'empty')
      scanTimers.push(
        setTimeout(() => publishScan('1 sample quest ready · Scan continuing', 'request'), 2000),
      );
    if (mode === 'partial') {
      scanTimers.push(
        setTimeout(
          () => publishScan('Sample source unavailable: connection interrupted', null, 'failed'),
          3500,
        ),
      );
      return;
    }
    if (mode !== 'empty') {
      scanTimers.push(
        setTimeout(() => publishScan('Sample APR-42 reviewed · 2 quests ready', 'approval'), 3500),
      );
      scanTimers.push(
        setTimeout(
          () => publishScan('Sample Thread 17 reviewed · 3 quests ready', 'followup'),
          5000,
        ),
      );
    }
    scanTimers.push(setTimeout(() => publishScan('Sample scan complete', null, 'complete'), 6000));
  }
  function renderScanContent(next) {
    if (next === 'setup') {
      body.innerHTML = `<div class="face">${title('Finding your first quests')}<p class="body-copy">The first scan isn’t instant. Cards appear as they’re found. You can keep working while I scan.</p><p class="fine-print">This is a simulated scan. No workspace is connected.</p></div>`;
      footer.innerHTML = `${button('Start setup preview', 'start-setup', true)}<button class="text-button setup-skip" data-do="skip-setup">Skip to ready preview</button>`;
      footer.hidden = false;
    }
    if (next === 'activity') {
      const n = readyIds.size,
        running = scanStatus === 'running',
        failed = scanStatus === 'failed';
      const heading = running
        ? n
          ? 'Your first quest is ready'
          : 'Looking for your first quest'
        : failed
          ? n
            ? `${n} quests ready. Scan incomplete.`
            : 'The scan couldn’t finish'
          : n
            ? 'Sample scan complete'
            : 'No quests found';
      const message = running
        ? n
          ? 'More sources are still being checked.'
          : 'No quests yet. The first scan is still running.'
        : failed
          ? n
            ? 'Sample source couldn’t be checked: connection interrupted.'
            : 'Sample source: permission denied. No quests are ready yet.'
          : 'The first scan finished. ' +
            (n
              ? 'Your sample quests are ready.'
              : 'Nothing needs your attention in the sources checked.');
      body.innerHTML = `<div class="face">${title(heading)}<p class="body-copy">${message}</p><p class="activity-label">Simulated activity · no workspace connected</p>${activityRows(scanEvents.slice(-3))}${scanEvents.length > 3 ? `<details class="activity-history"><summary>Activity</summary>${activityRows(scanEvents)}</details>` : ''}</div>`;
      footer.innerHTML = n
        ? `<div class="action-pair">${button('Keep working', 'close')}${button(running ? 'Review first quest' : `Review ${n} quests`, 'review-ready', true)}</div>${failed ? '<button class="text-button setup-skip" data-do="start-setup">Retry sample source</button>' : ''}`
        : failed
          ? button('Retry sample source', 'start-setup', true)
          : button(running ? 'Keep working' : 'Done for now', 'close', true);
      footer.hidden = false;
    }
  }
  function renderQuestContent(next) {
    if (next === 'deck') {
      if (!current) current = items.find((i) => readyIds.has(i.id) && !handled.has(i.id)) || null;
      if (
        current &&
        task &&
        !current.tasks.includes(task) &&
        cardPacks.get(current.id).steeringTask !== task
      ) {
        task = null;
        note = '';
        writeNote = '';
      }
      if (current) {
        const c = copy[current.id],
          depth = Math.min(3, items.filter((i) => readyIds.has(i.id) && !handled.has(i.id)).length);
        body.innerHTML = `<div class="card-stack" data-depth="${depth}"><article id="swipe-card" class="quest-face" tabindex="0" aria-label="Quest. Use Later or Next step."><span class="edge-label left" aria-hidden="true">Later</span><span class="edge-label right" aria-hidden="true">Next steps</span><div class="quest-meta">${scanStatus === 'running' ? `<button class="scan-meta" id="scan-meta" data-do="activity">${readyIds.size} ready · Scan running</button>` : `<span>${items.indexOf(current) + 1} of ${readyIds.size}</span>`}<span>${c.age}</span></div>${title(c.headline)}<p class="quest-copy">${c.body}</p><button class="evidence-link" data-do="evidence">2 sources · ${current.record}</button></article></div>`;
        footer.innerHTML = `<div class="swipe-actions"><button class="swipe-action" data-do="left" aria-label="Later" aria-describedby="later-description"><span class="swipe-circle"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m8 8 16 16M24 8 8 24"/></svg></span><span>Later</span></button><button class="swipe-action next" data-do="right" aria-label="Next step" aria-describedby="next-description"><span class="swipe-circle"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 16 6 6 12-13"/></svg></span><span>Next step</span></button></div><span class="sr-only" id="later-description">Opens snooze choices. Nothing is discarded.</span><span class="sr-only" id="next-description">Opens task choices. Nothing is accepted or sent.</span>`;
        footer.hidden = false;
      } else {
        body.innerHTML = `<div class="face">${title(scanStatus === 'running' ? 'Looking for more quests' : 'Nothing waiting.')}<p class="body-copy">${scanStatus === 'running' ? 'You’ve reviewed the available quests. The scan is still running.' : 'Come back when there’s another loose end.'}</p></div>`;
        if (scanStatus === 'running') {
          footer.innerHTML = button('Keep working', 'close', true);
          footer.hidden = false;
        }
      }
    }
    if (next === 'snooze') {
      body.innerHTML = `<div class="face">${title('When should this return?')}<p class="face-context">${current.record} · ${copy[current.id].short}</p><div class="choice-list">${snoozes.map((s, n) => choice(n + 1, s.label, s.help, `data-snooze="${n}" data-action-id="${current.record}:snooze:${s.id}"`)).join('')}</div></div>`;
    }
    if (next === 'snoozed') {
      body.innerHTML = `<div class="face">${title('Snoozed in this preview')}<p class="date-value">Returns: <time datetime="${lastSnooze.dueAt}">${lastSnooze.time}</time></p><p class="body-copy">No real reminder was scheduled.</p></div>`;
      footer.innerHTML = `<div class="action-pair">${button('Undo', 'undo')}${button('Next quest', 'next', true)}</div>`;
      footer.hidden = false;
    }
    if (next === 'act') {
      body.innerHTML = `<div class="face">${title('What should I prepare?')}<p class="face-context">${current.record} · ${copy[current.id].short}</p><div class="choice-list">${cardPacks
        .get(current.id)
        .actionOptions.map((t, n) =>
          choice(
            n + 1,
            t.childCard.title,
            t.childCard.help,
            `data-task="${n}" data-action-id="${t.actionId}"`,
          ),
        )
        .join(
          '',
        )}</div><button class="evidence-link" data-do="evidence">View evidence</button></div>`;
    }
    if (next === 'evidence') {
      body.innerHTML = `<div class="face"><blockquote class="quote" id="panel-title" tabindex="-1">${current.quote}</blockquote><p class="source-meta">${current.cite}<br>${current.evidence}</p><p class="source-meta">${current.source}</p><p class="fine-print">Fixture records. Snapshot only; check the current source before acting.</p></div>`;
    }
  }
  function renderTaskContent(next) {
    if (next === 'brief' || next === 'edit') {
      body.innerHTML = `<div class="face">${title(taskLabel())}<p class="face-context">Demo agent · ${current.record}</p><dl class="scope-list"><div><dt>Read</dt><dd>${task.childCard.read}</dd></div><div><dt>Return</dt><dd>${task.childCard.output}</dd></div><div><dt>Limits</dt><dd>No messages, record changes, approvals or screen access.</dd></div></dl><p class="brief-label">Exact outgoing brief</p>${next === 'edit' ? `<label class="sr-only" for="action-note">Task brief</label><textarea class="note-field" id="action-note" maxlength="900">${esc(note)}</textarea>` : `<div class="exact-brief" id="payload-note" data-selectable>${esc(note)}</div><button class="evidence-link" data-do="edit">Edit brief</button>`}<p class="fine-print">Preview only. No model request leaves this browser.</p><p class="form-error" id="form-error" role="status"></p></div>`;
      const existingJob = jobs.get(current.id),
        acceptLabel =
          existingJob && existingJob.status !== 'canceled'
            ? 'View existing task'
            : accepted.has(current.id)
              ? 'Accept quest'
              : 'Accept quest · +10 XP';
      footer.innerHTML = button(
        next === 'edit' ? 'Save & review' : acceptLabel,
        next === 'edit' ? 'save-brief' : 'dispatch',
        true,
      );
      footer.hidden = false;
    }
    if (next === 'dispatched' || next === 'running') {
      body.innerHTML = `<div class="face"><p class="state-label">Preview job · ${next === 'dispatched' ? 'accepted' : 'preparing'}</p>${title('Preparing preview result')}<p class="body-copy">Demo agent · ${taskLabel()}</p><p class="fine-print">No live agent is running.</p></div>`;
      footer.innerHTML = button('Cancel preview job', 'cancel-job');
      footer.hidden = false;
    }
    if (next === 'canceled') {
      body.innerHTML = `<div class="face">${title('Preview job canceled')}<p class="body-copy">Acceptance XP kept. Nothing was sent or changed.</p></div>`;
      footer.innerHTML = button('Choose another task', 'cancel', true);
      footer.hidden = false;
    }
    if (next === 'result') {
      const resultTitle = taskLabel().startsWith('Draft') ? 'Draft ready' : 'Summary ready';
      body.innerHTML = `<div class="face">${title(resultTitle)}<div class="result-copy" data-selectable>${task.result}</div><p class="fine-print">Prepared in this preview. Nothing was sent.</p><button class="evidence-link" data-do="evidence">View evidence</button></div>`;
      footer.innerHTML = `<div class="action-pair">${task.write ? button(task.write.operation.startsWith('Close') ? 'Review closing' : 'Review sending', 'review-write') : ''}${button('Next quest', 'next', true)}</div>`;
      footer.hidden = false;
    }
  }
  function renderSourceActionContent(next) {
    if (next === 'write-preview' || next === 'write-edit') {
      const closing = task.write.operation.startsWith('Close');
      body.innerHTML = `<div class="face">${title(closing ? `Close ${current.record}` : `Send to ${current.id === 'request' ? 'Maya' : current.id === 'approval' ? 'Noah' : 'Leo'}`)}<p class="body-copy">${task.write.warning}</p><dl class="scope-list"><div><dt>Target</dt><dd>${task.write.target}</dd></div><div><dt>Action</dt><dd>${task.write.operation}</dd></div></dl>${next === 'write-edit' ? `<label class="sr-only" for="source-note">Source action text</label><textarea id="source-note" class="note-field" maxlength="900">${esc(writeNote)}</textarea>` : `<div class="exact-brief" data-selectable>${esc(writeNote)}</div><button class="evidence-link" data-do="edit-write">Edit text</button>`}<p class="fine-print">Preview only. No ${closing ? 'request will be closed' : 'message will be sent'}. Live execution requires fresh permission and source-state checks.</p><p class="form-error" id="form-error" role="status"></p></div>`;
      footer.innerHTML = button(
        next === 'write-edit'
          ? 'Save & review'
          : closing
            ? `Simulate closing ${current.record}`
            : `Simulate sending to ${current.id === 'request' ? 'Maya' : current.id === 'approval' ? 'Noah' : 'Leo'}`,
        next === 'write-edit' ? 'save-write' : 'confirm-write',
        true,
      );
      footer.hidden = false;
    }
    if (next === 'write-pending') {
      body.innerHTML = `<div class="face">${title('Checking the preview action')}<p class="body-copy">This is a fixture, not a source-system connection.</p></div>`;
    }
    if (next === 'write-receipt') {
      body.innerHTML = `<div class="face">${title(task.write.operation.startsWith('Close') ? 'Preview closure complete' : 'Preview send complete')}<p class="body-copy">Fixture result only. The source is unchanged.</p><p class="source-meta">${task.write.result}</p></div>`;
      footer.innerHTML = button('Next quest', 'next', true);
      footer.hidden = false;
    }
    if (next === 'failed') {
      const errors = {
        denied: ['Permission denied', 'The required source permission is missing.'],
        changed: [
          'Source changed — review again',
          'Refresh the current record before a new decision.',
        ],
        failed: [
          'Outcome unverified',
          'Reconcile the source before retrying. The write may have applied.',
        ],
        missing: ['Evidence missing', 'Missing evidence cannot justify closure.'],
      };
      const action = sourceActions.get(sourceKey(current, task));
      const error = errors[action?.outcome || response.value] || errors.failed;
      body.innerHTML = `<div class="face">${title(error[0])}<p class="error-reason">${error[1]}</p><p class="fine-print">Fixture outcome only. The source is unchanged.</p></div>`;
      footer.hidden = true;
    }
  }
  function canSwipeView() {
    return navigation.length > 0 || (Boolean(current) && !['setup', 'activity'].includes(view));
  }
  function canSnoozeView() {
    return (
      Boolean(current) &&
      canSwipeView() &&
      ![
        'setup',
        'activity',
        'snooze',
        'snoozed',
        'dispatched',
        'running',
        'write-pending',
      ].includes(view)
    );
  }
  function cardSwipeControls() {
    return `<div class="swipe-actions"><button class="swipe-action" data-do="left" aria-label="Later" ${canSnoozeView() ? '' : 'disabled'}><span class="swipe-circle"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m8 8 16 16M24 8 8 24"/></svg></span><span>Later</span></button><button class="swipe-action next" data-do="right" aria-label="${view === 'deck' ? 'Next step' : 'Back'}"><span class="swipe-circle"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 16 6 6 12-13"/></svg></span><span>${view === 'deck' ? 'Next step' : 'Back'}</span></button></div>`;
  }
  function renderSteeringContent(next) {
    if (next === 'steer') {
      body.innerHTML = `<div class="face">${title('Adjust the prepared prompt')}<p class="body-copy">${current.record}. Edit this copy; generated choices stay unchanged.</p><label class="steering-label" for="steering-prompt">Prepared prompt</label><textarea id="steering-prompt" class="note-field" maxlength="900">${esc(note)}</textarea><p class="body-copy">Editing cannot grant message, record-write, approval or screen permissions.</p><p id="steering-error" class="form-error" role="status"></p></div>`;
      footer.innerHTML = button('Review prompt', 'review-prompt', true);
      footer.hidden = false;
    }
    if (next === 'brief') {
      body
        .querySelector('.face')
        .insertAdjacentHTML(
          'beforeend',
          `<div class="handoff-actions"><button class="button" data-do="copy-prompt">Copy prompt</button><button class="button" data-tool="claude">Copy prompt + Open Claude</button><button class="button" data-tool="codex">Copy prompt + Open Codex</button></div><p class="body-copy">Paste into the opened tool. Opening it does not run or complete this quest.</p><p id="handoff-status" class="handoff-status" role="status"></p><div id="manual-copy" class="manual-copy" hidden><label for="manual-prompt">Select and copy the prompt manually</label><textarea id="manual-prompt" readonly>${esc(note)}</textarea><button class="button" data-do="select-prompt">Select prompt</button></div>`,
        );
    }
    if (next === 'result' && task.isSteering) {
      body.innerHTML = `<div class="face">${title('Prompt captured')}<div class="exact-brief" data-selectable>${esc(note)}</div><p class="body-copy">Captured in this preview. No agent was called and nothing was sent or changed.</p></div>`;
      footer.innerHTML = button('Next quest', 'next', true);
      footer.hidden = false;
    }
  }
  async function handoffPrompt(toolName) {
    const destinations = { claude: 'https://claude.ai/', codex: 'https://chatgpt.com/codex/' };
    const output = body.querySelector('#handoff-status');
    if (!output) return;
    let opened = false,
      copied = false;
    if (toolName) {
      try {
        const popup = window.open('about:blank', '_blank');
        if (popup) {
          popup.opener = null;
          popup.location.href = destinations[toolName];
          opened = true;
        }
      } catch {}
    }
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(note);
      copied = true;
    } catch {
      body.querySelector('#manual-copy').hidden = false;
    }
    const name = toolName === 'claude' ? 'Claude' : 'Codex';
    output.textContent = toolName
      ? `${copied ? 'Prompt copied.' : 'Clipboard unavailable: copy manually.'} ${opened ? `${name} opened; paste the prompt there.` : `Browser blocked the ${name} window.`}`
      : copied
        ? 'Prompt copied. No tool was opened.'
        : 'Clipboard unavailable. Select and copy the prompt below.';
    if (toolName && !opened) {
      const link = document.createElement('a');
      link.href = destinations[toolName];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = ` Open ${name}`;
      output.append(link);
    }
  }
  function decorateDecisionCard() {
    const existing = body.querySelector('#swipe-card');
    const card = () => body.querySelector('#swipe-card');
    if (!existing)
      body.innerHTML = `<div class="card-stack" data-depth="1"><article id="swipe-card" class="quest-face decision-face" tabindex="0" aria-label="Decision card">${body.innerHTML}</article></div>`;
    body.querySelector('.quest-meta')?.remove();
    if (current && ['deck', 'act', 'snooze'].includes(view)) {
      body
        .querySelector('#swipe-card')
        .insertAdjacentHTML(
          'beforeend',
          `<button class="other-option" data-do="steer" data-action-id="${cardPacks.get(current.id).otherId}">Other…</button>`,
        );
    }
    if (canSwipeView()) {
      if (!existing && !footer.hidden && footer.innerHTML)
        body
          .querySelector('#swipe-card')
          .insertAdjacentHTML('beforeend', `<div class="card-commit">${footer.innerHTML}</div>`);
      footer.innerHTML = cardSwipeControls();
      footer.hidden = false;
    }
    const content = document.createElement('div');
    content.className = 'card-content';
    while (card().firstChild) content.append(card().firstChild);
    card().append(content);
  }
  function saveDraft() {
    if (view === 'edit') note = document.getElementById('action-note').value;
    if (view === 'steer') note = document.getElementById('steering-prompt').value;
    if (view === 'write-edit') writeNote = document.getElementById('source-note').value;
  }
  function pushCard(next) {
    if (next === view) return;
    saveDraft();
    navigation.push({ view, current, task, note, writeNote });
    transitionTo(next, 'forward');
  }
  function showJob(job) {
    current = job.quest;
    task = job.task;
    note = job.note;
    render(job.status === 'ready' ? 'result' : job.status === 'canceled' ? 'canceled' : job.status);
  }
  function dispatchTask(event) {
    const existing = jobs.get(current.id);
    if (existing && existing.status !== 'canceled') {
      saveDraft();
      navigation.push({ view, current, task, note, writeNote });
      showJob(existing);
      return;
    }
    if (!note.trim()) {
      document.getElementById('form-error').textContent = 'Enter a task brief before accepting.';
      return;
    }
    const job = { quest: current, task, note, status: 'dispatched' };
    jobs.set(current.id, job);
    rewardQuest(event);
    pushCard('dispatched');
    job.stageTimer = setTimeout(() => {
      if (job.status === 'canceled') return;
      job.status = 'running';
      if (current === job.quest && view === 'dispatched') render('running');
    }, 450);
    job.finishTimer = setTimeout(() => {
      if (job.status === 'canceled') return;
      job.status = 'ready';
      handled.add(job.quest.id);
      updateCount();
      if (current === job.quest && ['running', 'dispatched'].includes(view)) showJob(job);
      status.textContent = 'Preview result ready. Nothing was sent.';
    }, 1300);
  }
  function sourceKey(quest, chosenTask) {
    return `${quest.id}:${quest.tasks.indexOf(chosenTask)}`;
  }
  function showSourceAction(action) {
    current = action.quest;
    task = action.task;
    writeNote = action.note;
    render(
      action.status === 'pending'
        ? 'write-pending'
        : action.outcome === 'success'
          ? 'write-receipt'
          : 'failed',
    );
  }
  function confirmSourceAction() {
    const key = sourceKey(current, task),
      existing = sourceActions.get(key);
    if (existing && existing.status !== 'failed') {
      showSourceAction(existing);
      return;
    }
    const action = {
      quest: current,
      task,
      note: writeNote,
      outcome: response.value,
      status: 'pending',
    };
    sourceActions.set(key, action);
    render('write-pending');
    action.timer = setTimeout(() => {
      action.status = action.outcome === 'success' ? 'ready' : 'failed';
      if (
        sourceActions.get(key) === action &&
        current === action.quest &&
        task === action.task &&
        view === 'write-pending'
      )
        showSourceAction(action);
    }, 650);
  }
  // Motion adapted from free Page side-by-side and Panel reveal patterns:
  // https://transitions.dev/detail.html?t=page-side-by-side
  // https://transitions.dev/detail.html?t=panel-reveal
  // Custom Transitions.dev License; not a copy of its collection or tooling.
  function presentationClone(node) {
    const clone = node.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    clone.inert = true;
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('motion-ghost');
    return clone;
  }
  function clearMotionGhosts() {
    document.querySelectorAll('.motion-ghost').forEach((e) => e.remove());
  }
  function transitionTo(next, direction = 'forward') {
    clearMotionGhosts();
    const old = body.querySelector('#swipe-card'),
      animate = open && old && !reduced() && !keyboardMotion;
    let ghost, start, width, height, left, top;
    if (animate) {
      ghost = presentationClone(old);
      start = getComputedStyle(old).transform;
      width = old.offsetWidth;
      height = old.offsetHeight;
      left = old.offsetLeft + old.parentElement.offsetLeft;
      top = old.offsetTop + old.parentElement.offsetTop;
      ghost.dataset.scrollTop = String(old.querySelector('.card-content')?.scrollTop || 0);
    }
    render(next);
    if (!ghost) return;
    Object.assign(ghost.style, {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: '4',
      transform: start,
    });
    body.append(ghost);
    if (ghost.querySelector('.card-content'))
      ghost.querySelector('.card-content').scrollTop = Number(ghost.dataset.scrollTop || 0);
    const delta = direction === 'back' ? 8 : -8;
    const out = ghost.animate(
      [
        { transform: start, opacity: 1 },
        { transform: `${start === 'none' ? '' : start} translateX(${delta}px)`, opacity: 0 },
      ],
      { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
    out.finished.then(
      () => ghost.remove(),
      () => ghost.remove(),
    );
    const incoming = body.querySelector('#swipe-card');
    incoming?.animate(
      [
        {
          transform: `translate${direction === 'next' ? 'Y' : 'X'}(${direction === 'back' ? -8 : direction === 'next' ? 6 : 8}px)`,
          opacity: 0,
        },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
  }
  function render(next, focus = true) {
    view = next;
    panel.dataset.view = next;
    drag = null;
    transitioning = false;
    clearTimeout(idleTimer);
    if (blocked()) hint.hidden = true;
    updateCount();
    document.getElementById('reset-all').disabled = [
      'dispatched',
      'running',
      'write-pending',
    ].includes(next);
    response.disabled = ['dispatched', 'running', 'write-pending'].includes(next);
    footer.innerHTML = '';
    footer.hidden = true;
    renderScanContent(next);
    renderQuestContent(next);
    renderTaskContent(next);
    renderSourceActionContent(next);
    renderSteeringContent(next);
    decorateDecisionCard();
    updateInfo();
    body.scrollTop = 0;
    deck.scrollTop = 0;
    if (focus && open)
      (document.getElementById('panel-title') || body.querySelector('button'))?.focus({
        preventScroll: true,
      });
    if (open) positionInfo();
    armIdle();
  }
  function visibleAnchor(anchor = buddyAnchor) {
    return {
      x: Math.max(12, Math.min(innerWidth - 140, anchor.x)),
      y: Math.max(12, Math.min(innerHeight - 140, anchor.y)),
    };
  }
  function positionBuddy() {
    const a = visibleAnchor(open ? buddyPose : buddyAnchor);
    dock.style.left = `${a.x}px`;
    dock.style.top = `${a.y}px`;
    dock.dataset.anchorX = String(buddyAnchor.x);
    dock.dataset.anchorY = String(buddyAnchor.y);
    dock.dataset.displayY = String(a.y);
  }
  positionBuddy();
  function positionInfo() {
    if (!open) return;
    const a = visibleAnchor(buddyPose),
      width = info.offsetWidth,
      height = info.offsetHeight;
    buddyPose.x = a.x;
    buddyPose.y = Math.max(12, Math.min(a.y, innerHeight - 140 - height - 12));
    positionBuddy();
    info.style.setProperty(
      '--info-x',
      `${Math.max(12, Math.min(innerWidth - width - 12, buddyPose.x + 64 - width / 2))}px`,
    );
    info.style.setProperty('--info-y', `${buddyPose.y + 140}px`);
  }
  function placeDeck() {
    if (!open) return;
    const width = deck.offsetWidth,
      height = deck.offsetHeight,
      below = info.offsetTop + info.offsetHeight + 12;
    const y = below + height <= innerHeight - 12 ? below : Math.max(12, buddyPose.y - height - 12);
    deck.style.setProperty(
      '--deck-x',
      `${Math.max(12, Math.min(innerWidth - width - 12, buddyPose.x + 64 - width / 2))}px`,
    );
    deck.style.setProperty('--deck-y', `${Math.min(innerHeight - height - 12, y)}px`);
  }
  function setOpen(value, keyboard = false) {
    clearMotionGhosts();
    const wasOpen = open,
      animate = !reduced() && !keyboard,
      beforeTop = art.getBoundingClientRect().top;
    let closing;
    if (!value && wasOpen && animate) {
      closing = presentationClone(panel);
      closing.hidden = false;
    }
    [info, deck, art].forEach((node) => node.getAnimations().forEach((a) => a.cancel()));
    if (value && !wasOpen) Object.assign(buddyPose, visibleAnchor());
    open = value;
    panel.hidden = !value;
    dock.hidden = false;
    toggle.setAttribute('aria-expanded', String(value));
    hint.hidden = true;
    updateCount();
    if (value) {
      positionInfo();
      placeDeck();
      document.getElementById('panel-title')?.focus({ preventScroll: true });
    } else {
      positionBuddy();
      toggle.focus({ preventScroll: true });
    }
    if (animate) {
      const base = getComputedStyle(art).transform,
        offset = beforeTop - art.getBoundingClientRect().top,
        lifting = value && offset > 1;
      art.animate(
        [
          { transform: `${base === 'none' ? '' : base} translateY(${offset}px)`, offset: 0 },
          {
            transform: `${base === 'none' ? '' : base} translateY(${value ? -12 : 0}px)`,
            offset: 0.6,
          },
          { transform: base, offset: 1 },
        ],
        { duration: 240, delay: lifting ? 0 : 60, easing: 'cubic-bezier(.22,1,.36,1)' },
      );
      if (value) {
        info.animate(
          [
            { transform: 'translateY(8px)', opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 180, delay: lifting ? 240 : 0, easing: 'cubic-bezier(.22,1,.36,1)' },
        );
        deck.animate(
          [
            { transform: 'translateY(12px)', opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 240, delay: lifting ? 240 : 0, easing: 'cubic-bezier(.22,1,.36,1)' },
        );
      }
      if (closing) {
        document.body.append(closing);
        const exits = [...closing.querySelectorAll('.info-card,.deck-component')].map(
          (node) =>
            node.animate(
              [
                { transform: 'none', opacity: 1 },
                { transform: 'translateY(12px)', opacity: 0 },
              ],
              { duration: 160, easing: 'cubic-bezier(.22,1,.36,1)' },
            ).finished,
        );
        Promise.allSettled(exits).then(() => closing.remove());
      }
    }
    armIdle();
  }
  function showReview(value) {
    if (value && open) setOpen(false);
    document.getElementById('review-view').hidden = !value;
    document.getElementById('product-view').hidden = value;
    document.getElementById('review-toggle').textContent = value
      ? 'Back to preview'
      : 'Design & architecture';
    document.getElementById('review-toggle').setAttribute('aria-expanded', String(value));
    if (value) document.getElementById('architecture-view').open = true;
    else toggle.focus({ preventScroll: true });
  }
  function reset() {
    [pendingTimer, happyTimer, greetTimer, swipeTimer].forEach(clearTimeout);
    for (const job of jobs.values()) {
      clearTimeout(job.stageTimer);
      clearTimeout(job.finishTimer);
    }
    for (const action of sourceActions.values()) clearTimeout(action.timer);
    sourceActions.clear();
    jobs.clear();
    navigation.length = 0;
    scanTimers.splice(0).forEach(clearTimeout);
    readyIds.clear();
    scanEvents.length = 0;
    scanSeq = 0;
    scanStatus = 'not-started';
    handled.clear();
    accepted.clear();
    engaged = false;
    transitioning = false;
    renderSprite('idle');
    current = null;
    task = null;
    note = '';
    lastSnooze = null;
    hintDismissed = false;
    hint.hidden = true;
    response.value = 'success';
    render('setup', false);
    setOpen(false);
    showReview(false);
    status.textContent = 'Preview reset. Pip and zero acceptance XP.';
  }
  function showHint(accelerated = false) {
    if (
      document.hidden ||
      open ||
      blocked() ||
      hintDismissed ||
      !items.some((i) => readyIds.has(i.id) && !handled.has(i.id))
    )
      return;
    hint.hidden = false;
    status.textContent = accelerated
      ? 'Demo idle accelerator; no time has elapsed and no quest was accepted.'
      : 'A quest is waiting. Nothing opens or runs automatically.';
  }
  function armIdle() {
    clearTimeout(idleTimer);
    if (document.hidden || open || blocked() || hintDismissed) return;
    idleTimer = setTimeout(() => showHint(false), 300000);
  }
  function chooseSide(side, event) {
    if (!canSwipeView() || transitioning) return;
    if (side === 'snooze' && !canSnoozeView()) return;
    sound('tick', event);
    if (side === 'snooze') pushCard('snooze');
    else if (view === 'deck') pushCard('act');
    else goBack();
  }
  function goBack() {
    saveDraft();
    const frame = navigation.pop();
    if (!frame) {
      setOpen(false, true);
      return;
    }
    const sameQuest = current === frame.current,
      latestTask = task,
      latestNote = note,
      latestWrite = writeNote;
    current = frame.current;
    task = sameQuest ? latestTask : frame.task;
    note = sameQuest ? latestNote : frame.note;
    writeNote = sameQuest ? latestWrite : frame.writeNote;
    const job = current && jobs.get(current.id);
    const action = current && task && sourceActions.get(sourceKey(current, task));
    if (action && ['write-pending', 'write-receipt', 'failed'].includes(frame.view)) {
      showSourceAction(action);
      return;
    }
    if (job && ['dispatched', 'running', 'result', 'canceled'].includes(frame.view)) {
      showJob(job);
      return;
    }
    transitionTo(frame.view, 'back');
  }
  toggle.addEventListener('click', (e) => {
    if (suppressBuddyClick) {
      suppressBuddyClick = false;
      return;
    }
    setOpen(!open, e.detail === 0);
    if (open) {
      sound('pop', e);
      if (e.detail && !reduced()) {
        renderSprite('blink');
        clearTimeout(greetTimer);
        greetTimer = setTimeout(() => renderSprite('idle'), 180);
      }
    }
  });
  toggle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.isPrimary === false || buddyDrag) return;
    [art, info].forEach((node) => node.getAnimations().forEach((a) => a.cancel()));
    const anchor = open ? buddyPose : visibleAnchor();
    buddyDrag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      anchorX: anchor.x,
      anchorY: anchor.y,
      moved: false,
    };
    toggle.setPointerCapture(e.pointerId);
  });
  toggle.addEventListener('pointermove', (e) => {
    if (!buddyDrag || e.pointerId !== buddyDrag.id) return;
    const dx = e.clientX - buddyDrag.x,
      dy = e.clientY - buddyDrag.y;
    if (!buddyDrag.moved && Math.hypot(dx, dy) < 8) return;
    buddyDrag.moved = true;
    const anchor = open ? buddyPose : buddyAnchor;
    anchor.x = buddyDrag.anchorX + dx;
    anchor.y = buddyDrag.anchorY + dy;
    if (open) positionInfo();
    else {
      Object.assign(buddyAnchor, visibleAnchor());
      positionBuddy();
    }
  });
  function finishBuddyDrag(e) {
    if (!buddyDrag || e.pointerId !== buddyDrag.id) return;
    suppressBuddyClick = buddyDrag.moved;
    buddyDrag = null;
    if (toggle.hasPointerCapture(e.pointerId)) toggle.releasePointerCapture(e.pointerId);
    if (suppressBuddyClick)
      setTimeout(() => {
        suppressBuddyClick = false;
      }, 200);
  }
  toggle.addEventListener('pointerup', finishBuddyDrag);
  toggle.addEventListener('pointercancel', finishBuddyDrag);
  window.addEventListener('resize', () => {
    if (open) {
      positionInfo();
      placeDeck();
    } else positionBuddy();
  });
  document.getElementById('close-panel').addEventListener('click', () => setOpen(false));
  document
    .getElementById('review-toggle')
    .addEventListener('click', () => showReview(document.getElementById('review-view').hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      goBack();
    }
    if (
      !e.repeat &&
      e.target.closest('#swipe-card') &&
      !e.target.closest('input,textarea,select,button,a,[data-selectable]') &&
      ['ArrowLeft', 'ArrowRight'].includes(e.key)
    ) {
      e.preventDefault();
      chooseSide(e.key === 'ArrowLeft' ? 'snooze' : 'act', e);
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (open && !panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  body.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('#swipe-card');
    if (
      !card ||
      !canSwipeView() ||
      drag ||
      transitioning ||
      e.isPrimary === false ||
      e.button !== 0 ||
      e.target.closest('button,a,input,textarea,summary,[data-selectable]')
    )
      return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      dy: 0,
      card,
      locked: false,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
  });
  body.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    drag.dx = e.clientX - drag.x;
    drag.dy = e.clientY - drag.y;
    drag.samples.push({ x: e.clientX, t: e.timeStamp });
    drag.samples = drag.samples.filter((s) => e.timeStamp - s.t <= 80);
    if (!drag.locked) {
      if (Math.abs(drag.dx) < 8 || Math.abs(drag.dx) <= 1.2 * Math.abs(drag.dy)) return;
      drag.locked = true;
      drag.card.setPointerCapture(e.pointerId);
      drag.card.classList.add('dragging');
    }
    if (drag.raf) return;
    drag.raf = requestAnimationFrame(() => {
      if (!drag) return;
      drag.raf = null;
      const dx = drag.dx,
        visual =
          Math.sign(dx) * (Math.min(110, Math.abs(dx)) + Math.max(0, Math.abs(dx) - 110) * 0.25);
      drag.card.dataset.direction = dx < 0 ? 'snooze' : 'act';
      drag.card.style.setProperty('--edge-opacity', Math.min(1, Math.abs(dx) / 48));
      drag.card.style.transform = `translateX(${visual}px) rotate(${reduced() ? 0 : Math.max(-5, Math.min(5, dx / 24))}deg)`;
    });
  });
  function endDrag(e, cancel = false) {
    if (!drag || drag.id !== e.pointerId) return;
    const d = drag;
    drag = null;
    cancelAnimationFrame(d.raf);
    const first = d.samples[0],
      velocity = (e.clientX - first.x) / Math.max(1, e.timeStamp - first.t),
      committed =
        d.locked &&
        !cancel &&
        (Math.abs(d.dx) >= Math.min(88, d.card.clientWidth * 0.24) ||
          (Math.abs(d.dx) >= 28 &&
            Math.abs(velocity) >= 0.5 &&
            Math.sign(velocity) === Math.sign(d.dx)));
    d.card.classList.remove('dragging');
    if (d.card.hasPointerCapture(e.pointerId)) d.card.releasePointerCapture(e.pointerId);
    if (committed) {
      chooseSide(d.dx < 0 ? 'snooze' : 'act', e, true);
    } else {
      d.card.style.transform = '';
      delete d.card.dataset.direction;
    }
  }
  body.addEventListener('pointerup', (e) => endDrag(e));
  body.addEventListener('pointercancel', (e) => endDrag(e, true));
  body.addEventListener('lostpointercapture', (e) => {
    if (drag && e.target === drag.card && !drag.card.hasPointerCapture(e.pointerId))
      endDrag(e, true);
  });
  panel.addEventListener('click', (e) => {
    if (transitioning) return;
    const snooze = e.target.closest('[data-snooze]');
    if (snooze && view === 'snooze') {
      lastSnooze = resolveSnooze(Number(snooze.dataset.snooze));
      engaged = true;
      handled.add(current.id);
      sound('drop', e);
      pushCard('snoozed');
      return;
    }
    const selected = e.target.closest('[data-task]');
    if (selected && view === 'act') {
      const active = jobs.get(current.id);
      if (active && active.status !== 'canceled') {
        saveDraft();
        navigation.push({ view, current, task, note, writeNote });
        showJob(active);
        return;
      }
      const chosen = current.tasks[Number(selected.dataset.task)];
      if (chosen !== task) {
        note = chosen.brief;
        writeNote = '';
      }
      task = chosen;
      sound('tick', e);
      pushCard('brief');
      return;
    }
    const tool = e.target.closest('[data-tool]');
    if (tool) {
      handoffPrompt(tool.dataset.tool);
      return;
    }
    const command = e.target.closest('[data-do]')?.dataset.do;
    if (!command) return;
    if (command === 'start-setup') return startScan();
    if (command === 'skip-setup') {
      scanTimers.splice(0).forEach(clearTimeout);
      items.forEach((i) => readyIds.add(i.id));
      scanStatus = 'skipped';
      updateCount();
      return render('deck');
    }
    if (command === 'review-ready') return render('deck');
    if (command === 'activity') return pushCard('activity');
    if (command === 'close') return setOpen(false);
    if (command === 'cancel-job') {
      const job = jobs.get(current.id);
      if (job) {
        clearTimeout(job.stageTimer);
        clearTimeout(job.finishTimer);
        job.status = 'canceled';
      }
      render('canceled');
      return;
    }
    if (command === 'left' || command === 'right')
      return chooseSide(command === 'left' ? 'snooze' : 'act', e);
    if (['dispatched', 'running', 'write-pending'].includes(view)) return;
    if (command === 'next') {
      navigation.length = 0;
      current = null;
      task = null;
      note = '';
      writeNote = '';
      transitionTo('deck', 'next');
      return;
    }
    if (command === 'undo') {
      handled.delete(current.id);
      navigation.length = 0;
      render('deck');
      return;
    }
    if (command === 'evidence') return pushCard('evidence');
    if (command === 'cancel') return goBack();
    if (command === 'steer') {
      if (!task) {
        task = cardPacks.get(current.id).steeringTask;
        note = task.brief;
      }
      pushCard('steer');
      return;
    }
    if (command === 'review-prompt') {
      const input = document.getElementById('steering-prompt');
      if (!input.value.trim()) {
        document.getElementById('steering-error').textContent = 'Enter a prompt before review.';
        input.focus();
        return;
      }
      note = input.value;
      pushCard('brief');
      return;
    }
    if (command === 'copy-prompt') {
      handoffPrompt();
      return;
    }
    if (command === 'select-prompt') {
      const input = document.getElementById('manual-prompt');
      input.focus();
      input.select();
      return;
    }
    if (command === 'edit') return pushCard('edit');
    if (command === 'save-brief') {
      const value = document.getElementById('action-note').value.trim();
      if (!value) {
        document.getElementById('form-error').textContent = 'Enter a task brief.';
        document.getElementById('action-note').focus();
        return;
      }
      note = value;
      navigation.pop();
      render('brief');
      return;
    }
    if (command === 'dispatch' && view === 'brief') return dispatchTask(e);
    if (command === 'review-write') {
      const existing = sourceActions.get(sourceKey(current, task));
      if (existing && existing.status !== 'failed') {
        navigation.push({ view, current, task, note, writeNote });
        showSourceAction(existing);
        return;
      }
      if (!writeNote) writeNote = task.write.note;
      pushCard('write-preview');
      return;
    }
    if (command === 'cancel-write') return goBack();
    if (command === 'edit-write') return pushCard('write-edit');
    if (command === 'save-write') {
      const value = document.getElementById('source-note').value.trim();
      if (!value) {
        document.getElementById('form-error').textContent = 'Enter the action text.';
        return;
      }
      writeNote = value;
      navigation.pop();
      render('write-preview');
      return;
    }
    if (command === 'confirm-write' && view === 'write-preview') return confirmSourceAction();
  });
  document.getElementById('reset-all').addEventListener('click', reset);
  document.getElementById('demo-idle').addEventListener('click', () => {
    showReview(false);
    hintDismissed = false;
    showHint(true);
  });
  document.getElementById('dismiss-hint').addEventListener('click', () => {
    hint.hidden = true;
    hintDismissed = true;
    clearTimeout(idleTimer);
  });
  document.getElementById('snooze-hint').addEventListener('click', () => {
    hint.hidden = true;
    armIdle();
  });
  ['pointerdown', 'keydown', 'scroll'].forEach((type) =>
    document.addEventListener(type, armIdle, { passive: true }),
  );
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hint.hidden = true;
    armIdle();
  });
  renderSprite();
  updateSound();
  render('setup', false);
  armIdle();
})();
