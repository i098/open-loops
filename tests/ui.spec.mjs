import { test, expect } from '@playwright/test';

const dialog = (page) => page.getByRole('dialog', { name: 'Open Loops', exact: true });
const back = (page) => page.locator('#pocket-actions [data-do="right"]');
const close = (page) => page.getByRole('button', { name: 'Close Open Loops' });
const card = (page) => page.locator('#swipe-card');
const accept = (page) => page.getByRole('button', { name: /^Accept quest/ });

async function expectCardClearance(page) {
  const bottom = await page.locator('.card-stack').evaluate((stack) => {
    const bounds = stack.getBoundingClientRect();
    const projected = ['::before', '::after'].map((selector) => {
      const style = globalThis.getComputedStyle(stack, selector);
      if (style.display === 'none' || style.content === 'none') return bounds.bottom;
      const shift =
        style.transform === 'none' ? 0 : new globalThis.DOMMatrixReadOnly(style.transform).m42;
      return bounds.bottom - (Number.parseFloat(style.bottom) || 0) + shift;
    });
    return Math.max(bounds.bottom, ...projected);
  });
  const footer = await page.locator('#pocket-actions .swipe-circle').first().boundingBox();
  expect(footer.y - bottom).toBeGreaterThanOrEqual(8);
}

async function expectPlacedBuddy(page) {
  const dock = page.locator('#buddy-dock');
  await close(page).click();
  const initial = await dock.boundingBox();
  const viewport = page.viewportSize();
  const handle = await page.locator('#buddy-toggle').boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(viewport.width * 0.65, viewport.height - initial.height / 2 - 12, {
    steps: 10,
  });
  await page.mouse.up();
  const resting = await dock.boundingBox();
  expect(Math.abs(resting.x - initial.x) + Math.abs(resting.y - initial.y)).toBeGreaterThan(30);
  await page.locator('#buddy-toggle').click();
  await expect(card(page)).toBeVisible();
  const displayed = await dock.boundingBox();
  const info = await page.locator('#info-card').boundingBox();
  expect(info.y - displayed.y - displayed.height).toBeGreaterThanOrEqual(4);
  const deck = await page.locator('#deck-component').boundingBox();
  expect(displayed.y - deck.y - deck.height).toBeGreaterThanOrEqual(4);
  for (const region of [info, deck]) {
    expect(region.x).toBeGreaterThanOrEqual(0);
    expect(region.y).toBeGreaterThanOrEqual(0);
    expect(region.x + region.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(region.y + region.height).toBeLessThanOrEqual(viewport.height + 1);
  }
  await close(page).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Close Open Loops' })).toHaveCount(0);
  expect(await dock.boundingBox()).toEqual(resting);
  await page.locator('#buddy-toggle').click();
  await expect(card(page)).toBeVisible();
  const deckBefore = await card(page).boundingBox();
  const infoBefore = await page.locator('#info-card').boundingBox();
  const openHandle = await page.locator('#buddy-toggle').boundingBox();
  await page.mouse.move(openHandle.x + openHandle.width / 2, openHandle.y + openHandle.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    openHandle.x + openHandle.width / 2 + 70,
    openHandle.y + openHandle.height / 2 - 40,
    { steps: 10 },
  );
  await page.mouse.up();
  const followed = await page.locator('#info-card').boundingBox();
  expect(Math.abs(followed.x - infoBefore.x) + Math.abs(followed.y - infoBefore.y)).toBeGreaterThan(
    20,
  );
  const deckAfter = await card(page).boundingBox();
  expect(Math.abs(deckAfter.x - deckBefore.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(deckAfter.y - deckBefore.y)).toBeLessThanOrEqual(2);
  const dropped = await dock.boundingBox();
  await close(page).click();
  await expect(dialog(page)).toBeHidden();
  expect(await dock.boundingBox()).toEqual(dropped);
  await page.locator('#buddy-toggle').click();
  await expect(card(page)).toBeVisible();
  expect(await dock.boundingBox()).toEqual(dropped);
  await expectSteadyBuddyClick(page);
}

async function expectSteadyBuddyClick(page) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await close(page).click();
  await expect(dialog(page)).toBeHidden();
  const motion = page.evaluate(
    () =>
      new Promise((resolve) => {
        const samples = [];
        const sample = () => {
          samples.push(
            ['#buddy-dock', '#buddy-art'].map((selector) => {
              const bounds = globalThis.document.querySelector(selector).getBoundingClientRect();
              return { x: bounds.x, y: bounds.y };
            }),
          );
        };
        sample();
        globalThis.document.querySelector('#buddy-toggle').addEventListener(
          'click',
          () => {
            const frame = () => {
              sample();
              if (samples.length < 25) globalThis.requestAnimationFrame(frame);
              else resolve(samples);
            };
            globalThis.requestAnimationFrame(frame);
          },
          { once: true },
        );
      }),
  );
  await page.locator('#buddy-toggle').click();
  const samples = await motion;
  for (const index of [0, 1]) {
    for (const axis of ['x', 'y']) {
      const values = samples.map((sample) => sample[index][axis]);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
    }
  }
  await expect(card(page)).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function openReady(page, keyboard = false) {
  await page.goto('/open-loops.html');
  const buddy = page.getByRole('button', { name: /^Open Open Loops/ });
  if (keyboard) {
    await buddy.focus();
    await page.keyboard.press('Space');
  } else {
    await buddy.click();
  }
  await page.getByRole('button', { name: 'Skip to ready preview' }).click();
  await expect(card(page)).toBeVisible();
}

async function expectXP(page, value) {
  await expect(
    page.locator('#demo-xp').filter({ hasText: new RegExp(`\\b${value}\\s*XP\\b`) }),
  ).toBeVisible();
  await expect(page.locator('#xp-track')).toHaveAttribute('aria-valuenow', String(value));
  const maximum = Number(await page.locator('#xp-track').getAttribute('aria-valuemax'));
  expect(maximum).toBe(value < 20 ? 20 : 30);
}

async function drag(page, distance) {
  const box = await card(page).getByRole('heading').boundingBox();
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + distance, start.y, { steps: 8 });
  return start;
}

async function swipeTo(page, distance, heading) {
  await drag(page, distance);
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await expect(card(page)).toHaveCount(1);
  const box = await card(page).boundingBox();
  expect(Math.abs(box.height - (box.width * 7) / 5)).toBeLessThanOrEqual(2);
}

async function exercisePromptSteering(page) {
  await page.locator('[data-do="steer"]').click();
  const editor = page.locator('#steering-prompt');
  const prepared = await editor.inputValue();
  expect(prepared).toContain('REQ-184');
  const edited = `${prepared}\nFocus on uncertainty. <note>Keep this literal.</note>`;
  await editor.fill(edited);
  await expectXP(page, 0);
  await back(page).click();
  await page.locator('[data-do="steer"]').click();
  await expect(editor).toHaveValue(edited);
  await page.locator('[data-do="review-prompt"]').click();
  await expect(card(page)).toContainText(edited);
  await expect(card(page).locator('note')).toHaveCount(0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('[data-do="copy-prompt"]').click();
  await expect(page.locator('#handoff-status')).toContainText(/copied/i);
  expect(await page.evaluate(() => globalThis.navigator.clipboard.readText())).toBe(edited);
  await expectXP(page, 0);
  // Exercise the local handoff without contacting or impersonating a real provider.
  await page.context().route('https://claude.ai/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Handoff target</title>',
    }),
  );
  const popupReady = page.waitForEvent('popup');
  await page.locator('[data-tool="claude"]').click();
  const popup = await popupReady;
  try {
    await expect(popup).toHaveURL('https://claude.ai/');
    expect(await page.evaluate(() => globalThis.navigator.clipboard.readText())).toBe(edited);
    await expect(page.locator('#handoff-status')).toContainText(/paste the prompt/i);
    await expectXP(page, 0);
    await expect(page.getByRole('heading', { name: 'Preparing preview result' })).toHaveCount(0);
  } finally {
    await popup.close();
  }
  await page.evaluate(() => {
    Object.defineProperty(globalThis.navigator.clipboard, 'writeText', {
      configurable: true,
      value: async () => {
        throw new DOMException('Denied', 'NotAllowedError');
      },
    });
    globalThis.open = () => null;
  });
  await page.locator('[data-tool="codex"]').click();
  await expect(page.locator('#handoff-status')).toContainText(
    /Clipboard unavailable.*Browser blocked/i,
  );
  await expect(page.locator('#manual-prompt')).toHaveValue(edited);
  await expectXP(page, 0);
}

test('first scan streams honestly, offers a quest early, and survives minimization', async ({
  page,
}) => {
  const now = new Date('2026-10-23T10:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto('/open-loops.html');
  await page.getByRole('button', { name: /^Open Open Loops/ }).click();
  await expect(dialog(page)).toContainText(/simulated scan.*no workspace.*connected/i);
  await page.getByRole('button', { name: 'Start setup preview' }).click();
  await expect(dialog(page)).toContainText(/simulated activity.*no workspace.*connected/i);
  await expect(dialog(page)).toContainText(/sample scan started/i);
  await expect(page.locator('#scan-progress')).toBeVisible();
  await expect(page.locator('#scan-progress')).toHaveAttribute('role', 'progressbar');
  await expect(page.locator('#scan-progress')).not.toHaveAttribute('aria-valuenow', /.+/);
  await expect(page.getByRole('button', { name: 'Review first quest' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Keep working' }).click();
  await page.clock.runFor(2100);
  await expect(dialog(page)).toBeHidden();
  await page.getByRole('button', { name: /quests ready, scan continuing/ }).click();
  await page.getByRole('button', { name: 'Review first quest' }).click();
  await expect(card(page).getByRole('button', { name: /REQ-184/ })).toBeVisible();
  await expect(page.locator('#info-age')).toBeVisible();
  await expect(page.locator('#info-count')).toBeVisible();
  await expect(page.locator('#info-count')).toHaveText(/\d+ ready/);
  await page.locator('#info-count').click();
  await expect(page.locator('#scan-progress')).toBeVisible();
  await expect(page.locator('#scan-progress')).not.toHaveAttribute('aria-valuenow', /.+/);
  await page.getByRole('button', { name: 'Review first quest' }).click();
  await page.getByRole('button', { name: /Next step/ }).click();
  await page.getByRole('button', { name: /Draft a question for Maya/ }).click();
  await page.getByRole('button', { name: 'Edit brief' }).click();
  const draft = page.getByRole('textbox', { name: 'Task brief' });
  await draft.fill('Ask Maya whether anything remains. Do not send or change records.');
  await close(page).click();
  await page.clock.runFor(4100);
  await expect(dialog(page)).toBeHidden();
  await page.getByRole('button', { name: /^Open Open Loops/ }).click();
  await expect(draft).toHaveValue(
    'Ask Maya whether anything remains. Do not send or change records.',
  );
  await expectXP(page, 0);
});

test('ready preview has a draggable card; short drag cancels and right swipe only opens choices', async ({
  page,
}) => {
  await openReady(page);
  await expectXP(page, 0);
  await expectPlacedBuddy(page);
  const initial = await card(page).boundingBox();
  expect(Math.abs(initial.height - (initial.width * 7) / 5)).toBeLessThanOrEqual(2);
  expect(initial.width).toBeGreaterThanOrEqual(260);
  for (const name of [/Later/, /Next step/]) {
    const control = page.locator('#pocket-actions').getByRole('button', { name });
    const shape = await control.locator('.swipe-circle').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = globalThis.getComputedStyle(element);
      return {
        width: bounds.width,
        height: bounds.height,
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow,
      };
    });
    expect(Math.abs(shape.width - shape.height)).toBeLessThanOrEqual(2);
    const round = shape.radius.includes('%')
      ? Number.parseFloat(shape.radius) >= 50
      : Number.parseFloat(shape.radius) * 2 >= shape.width - 2;
    expect(round).toBe(true);
    expect(shape.shadow).toBe('none');
  }
  for (const surface of [dialog(page), card(page)]) {
    expect(
      await surface.evaluate((element) => globalThis.getComputedStyle(element).boxShadow),
    ).toBe('none');
  }
  const closeBefore = await close(page).boundingBox();
  const start = await drag(page, 60);
  const moved = await card(page).boundingBox();
  expect(moved.x - initial.x).toBeGreaterThan(40);
  expect(await close(page).boundingBox()).toEqual(closeBefore);
  // Hold still so this is not interpreted as a deliberate flick.
  await page.waitForTimeout(120);
  await page.mouse.move(start.x + 10, start.y);
  await page.waitForTimeout(120);
  await page.mouse.up();
  await expect(card(page)).toBeVisible();
  await expectXP(page, 0);
  const navigationRequests = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType())) navigationRequests.push(request.url());
  });
  await drag(page, 110);
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: 'What should I prepare?' })).toBeVisible();
  await expect(accept(page)).toHaveCount(0);
  await expectXP(page, 0);
  const options = card(page).getByRole('button', {
    name: /Check the duplicate evidence|Draft a closure recommendation|Draft a question for Maya/,
  });
  await expect(options).toHaveCount(3);
  const storedOptions = await options.allTextContents();
  await swipeTo(page, 110, /Laptop arrived/);
  await expectXP(page, 0);
  await swipeTo(page, 110, 'What should I prepare?');
  await swipeTo(page, -110, 'When should this return?');
  await expectXP(page, 0);
  await swipeTo(page, 110, 'What should I prepare?');
  await expectXP(page, 0);
  expect(await options.allTextContents()).toEqual(storedOptions);
  expect(navigationRequests).toEqual([]);
  await exercisePromptSteering(page);
});

test('keyboard left opens duration choices; snooze and undo never award XP', async ({ page }) => {
  await openReady(page, true);
  await card(page).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: 'When should this return?' })).toBeVisible();
  await page.getByRole('button', { name: /Tomorrow morning/ }).click();
  await expect(page.getByRole('heading', { name: 'Snoozed in this preview' })).toBeVisible();
  await expect(dialog(page)).toContainText(/No real reminder.*scheduled/i);
  await expectXP(page, 0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(card(page).getByRole('button', { name: /REQ-184/ })).toBeVisible();
  await expectXP(page, 0);
  await card(page).focus();
  await page.keyboard.press('ArrowLeft');
  await page.locator('[data-do="steer"]').click();
  await expect(page.locator('#steering-prompt')).toHaveValue(/REQ-184/);
  await back(page).click();
  await expect(page.getByRole('heading', { name: 'When should this return?' })).toBeVisible();
  await expectXP(page, 0);
});

test('only explicit acceptance earns ten XP, once across cancel and retry', async ({ page }) => {
  await openReady(page);
  await card(page).focus();
  await page.keyboard.press('ArrowRight');
  const choice = page.getByRole('button', { name: /Draft a question for Maya/ });
  await choice.click();
  await expectXP(page, 0);
  await back(page).click();
  await expectXP(page, 0);
  await choice.click();
  await page.getByRole('button', { name: 'Edit brief' }).click();
  const draft = page.getByRole('textbox', { name: 'Task brief' });
  await draft.fill('Draft one question for Maya. Do not send it.');
  await draft.press('Enter');
  await expectXP(page, 0);
  await page.getByRole('button', { name: 'Save & review' }).click();
  await swipeTo(page, -110, 'When should this return?');
  await expectXP(page, 0);
  await swipeTo(page, 110, 'Draft a question for Maya');
  await expect(dialog(page)).toContainText('Draft one question for Maya. Do not send it.');
  await accept(page).click();
  await expect(page.getByRole('heading', { name: 'Preparing preview result' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel preview job' }).click();
  await expect(dialog(page)).toContainText(/Acceptance XP kept/i);
  await expectXP(page, 10);
  await back(page).click();
  await expect(page.getByRole('heading', { name: 'Draft a question for Maya' })).toBeVisible();
  await expect(dialog(page)).toContainText('Draft one question for Maya. Do not send it.');
  await expect(accept(page)).not.toContainText('+10');
  await accept(page).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await expect(dialog(page)).toContainText(/prepared in this preview.*nothing was sent/i);
  await close(page).click();
  await page.getByRole('button', { name: /^Open Open Loops/ }).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await expectXP(page, 10);
});

test('secondary screens use only the external green Back; source actions need separate approval', async ({
  page,
}) => {
  await openReady(page);
  await page.getByRole('button', { name: /Next step/ }).click();
  const origin = await back(page).boundingBox();
  const closeOrigin = await close(page).boundingBox();
  const infoOrigin = await page.locator('#info-card').boundingBox();
  const panel = await card(page).boundingBox();
  expect(origin.y).toBeGreaterThanOrEqual(panel.y + panel.height);
  async function fixedBack() {
    await expect(back(page)).toHaveCount(1);
    await expect(back(page)).toHaveAccessibleName(/^Back/);
    await expect(card(page).getByRole('navigation')).toHaveCount(0);
    await expect(card(page).getByRole('button', { name: /^Back/ })).toHaveCount(0);
    const position = await back(page).boundingBox();
    expect(Math.abs(position.x - origin.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(position.y - origin.y)).toBeLessThanOrEqual(2);
    expect(await close(page).boundingBox()).toEqual(closeOrigin);
    expect(await page.locator('#info-card').boundingBox()).toEqual(infoOrigin);
  }
  await page.getByRole('button', { name: 'View evidence' }).click();
  await fixedBack();
  await expect(dialog(page)).toContainText(/fixture records/i);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Draft a question for Maya/ }).click();
  await fixedBack();
  await page.getByRole('button', { name: 'Edit brief' }).click();
  await fixedBack();
  await page.getByRole('button', { name: 'Save & review' }).click();
  await accept(page).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await page.getByRole('button', { name: 'Review sending' }).click();
  await fixedBack();
  await expect(page.getByRole('button', { name: 'Simulate sending to Maya' })).toBeVisible();
  await expect(dialog(page)).toContainText(/preview only.*no message will be sent/i);
  await back(page).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Preview send complete' })).toHaveCount(0);
  await expectXP(page, 10);
});

test('background task and source receipts cannot replace another quest draft', async ({ page }) => {
  const now = new Date('2026-10-23T10:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  for (const sourceReceipt of [false, true]) {
    await openReady(page);
    await page.getByRole('button', { name: /Next step/ }).click();
    await page.getByRole('button', { name: /Draft a closure recommendation/ }).click();
    await accept(page).click();
    if (sourceReceipt) {
      await page.clock.runFor(1400);
      await page.getByRole('button', { name: 'Review closing' }).click();
      await page.getByRole('button', { name: 'Simulate closing REQ-184' }).click();
      await back(page).click();
    } else {
      await back(page).click();
      await expect(
        page.getByRole('heading', { name: 'Draft a closure recommendation' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Later', exact: true }).click();
      await page.getByRole('button', { name: /Tomorrow morning/ }).click();
    }
    await page.getByRole('button', { name: 'Next quest', exact: true }).click();
    await page.getByRole('button', { name: /Next step/ }).click();
    await page.getByRole('button', { name: /Summarize the approval context/ }).click();
    await page.getByRole('button', { name: 'Edit brief' }).click();
    const editor = page.getByRole('textbox', { name: 'Task brief' });
    const draft = sourceReceipt ? 'Keep B draft after A receipt.' : 'Keep B draft after A task.';
    await editor.fill(draft);
    await page.clock.runFor(2000);
    await expect(editor).toHaveValue(draft);
    await expect(card(page)).toContainText('APR-42');
    await expectXP(page, 10);
  }
});

test.describe('narrow touch surface', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('touch swipe reaches choices, mute survives reopening, and 320px remains contained', async ({
    page,
  }) => {
    await openReady(page);
    const narrowCard = await card(page).boundingBox();
    expect(Math.abs(narrowCard.height - (narrowCard.width * 7) / 5)).toBeLessThanOrEqual(2);
    expect(narrowCard.width).toBeGreaterThanOrEqual(260);
    await expectCardClearance(page);
    await page.getByRole('button', { name: 'Mute sounds', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Unmute sounds' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const box = await card(page).getByRole('heading').boundingBox();
    const client = await page.context().newCDPSession(page);
    try {
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      for (const offset of [12, 35, 65, 110]) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: point.x - offset, y: point.y }],
        });
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(page.getByRole('heading', { name: 'When should this return?' })).toBeVisible();
      await expectXP(page, 0);
      await close(page).tap();
      await expect(dialog(page)).toBeHidden();
      await page.getByRole('button', { name: /^Open Open Loops/ }).tap();
      await expect(page.getByRole('heading', { name: 'When should this return?' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Unmute sounds' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await page.setViewportSize({ width: 320, height: 740 });
      await expect(back(page)).toBeVisible();
      await expect(close(page)).toBeVisible();
      expect(
        await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      await back(page).tap();
      const smallCard = await card(page).boundingBox();
      expect(Math.abs(smallCard.height - (smallCard.width * 7) / 5)).toBeLessThanOrEqual(2);
      expect(smallCard.width).toBeGreaterThanOrEqual(260);
      await expectCardClearance(page);
      await page.setViewportSize({ width: 320, height: 700 });
      const shortCard = await card(page).boundingBox();
      expect(Math.abs(shortCard.height - (shortCard.width * 7) / 5)).toBeLessThanOrEqual(2);
      expect(shortCard.width).toBeGreaterThanOrEqual(260);
      await expectCardClearance(page);
      await page.getByRole('button', { name: /Next step/ }).tap();
      await page.getByRole('button', { name: /Draft a question for Maya/ }).tap();
      await accept(page).tap();
      await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
      await expectXP(page, 10);
    } finally {
      await client.detach();
    }
  });
});

test('three unique acceptances unlock Scout at twenty and Guide at thirty', async ({ page }) => {
  await openReady(page);
  for (const [index, label] of [
    'Check the duplicate evidence',
    'Summarize the approval context',
    'Draft a reply to Leo',
  ].entries()) {
    await page.getByRole('button', { name: /Next step/ }).click();
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await accept(page).click();
    await expect(page.getByRole('heading', { name: /^(Summary|Draft) ready$/ })).toBeVisible();
    await expectXP(page, (index + 1) * 10);
    await expect(page.locator('#evolution-label')).toHaveText(['Pip', 'Scout', 'Guide'][index]);
    await page.getByRole('button', { name: 'Next quest', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Nothing waiting.' })).toBeVisible();
  await expectXP(page, 30);
});

test('My day filters records and opens provenance without presenting fixtures as live telemetry', async ({
  page,
}) => {
  await page.goto('/personal-observability.html');
  await expect(page.getByText(/example day.*synthetic data/i)).toBeVisible();
  const totals = page.getByRole('region', { name: 'Example day totals, all event types' });
  const before = await totals.innerText();
  const filters = page.getByRole('group', { name: 'Filter event type' });
  const records = page.getByRole('list', { name: 'Chronological events' });
  const nonSources = records.getByRole('button', {
    name: /\bApp context\b|\bAgent\b|Accepted:|Question submitted:/,
  });
  await expect(nonSources.first()).toBeVisible();
  await filters.getByRole('button', { name: 'Sources', exact: true }).click();
  await expect(filters.getByRole('button', { name: 'Sources', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(nonSources).toHaveCount(0);
  await records
    .getByRole('button', { name: /REQ-184 closure confirmed by source readback/ })
    .click();
  const details = page.getByRole('complementary', { name: 'Selected record details' });
  await expect(
    details.getByRole('heading', { name: 'REQ-184 closure confirmed by source readback' }),
  ).toBeVisible();
  await expect(details).toContainText(/observed.*fixture/i);
  await expect(details).toContainText('Example Jira readback');
  await expect(details).toContainText('RECEIPT-01');
  await expect(details).toContainText(/synthetic receipt.*not a live source action/i);
  await expect(totals).toHaveText(before);
  const memory = page.getByRole('tab', { name: /Saved memory/ });
  await memory.click();
  await expect(memory).toHaveAttribute('aria-selected', 'true');
  await page
    .getByRole('list', { name: 'Saved memory summaries' })
    .getByRole('button', { name: /Possible topic: launch planning/ })
    .click();
  await expect(details.getByText('Inferred', { exact: true })).toBeVisible();
  await expect(details).toContainText(/inference.*not observed attention/i);
  await details.getByRole('button', { name: /CTX-01/ }).click();
  await expect(page.getByRole('tab', { name: /Timeline/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    details.getByRole('heading', { name: 'Notes became the frontmost app' }),
  ).toBeVisible();
  await expect(details).toContainText('Example AX snapshot');
  await expect(
    page.getByText(/No live telemetry, AX access or memory database is connected/),
  ).toBeVisible();
});
