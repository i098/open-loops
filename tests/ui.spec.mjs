import { test, expect } from '@playwright/test';

const dialog = (page) => page.getByRole('dialog', { name: 'Open Loops', exact: true });
const back = (page) => dialog(page).getByRole('button', { name: /^Back/ });
const close = (page) => dialog(page).getByRole('button', { name: 'Close Open Loops' });
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
  const footer = await page.locator('#pocket-actions').boundingBox();
  expect(footer.y - bottom).toBeGreaterThanOrEqual(8);
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
    dialog(page)
      .locator('#demo-xp')
      .filter({ hasText: new RegExp(`\\b${value}\\s*XP\\b`) }),
  ).toBeVisible();
}

async function drag(page, distance) {
  const box = await card(page).getByRole('heading').boundingBox();
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + distance, start.y, { steps: 8 });
  return start;
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
  await expect(page.getByRole('button', { name: 'Review first quest' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Keep working' }).click();
  await page.clock.runFor(2100);
  await expect(dialog(page)).toBeHidden();
  await page.getByRole('button', { name: /quests ready, scan continuing/ }).click();
  await page.getByRole('button', { name: 'Review first quest' }).click();
  await expect(card(page).getByRole('button', { name: /REQ-184/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Scan running/ })).toBeVisible();
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
  const initial = await card(page).boundingBox();
  expect(Math.abs(initial.height - (initial.width * 7) / 5)).toBeLessThanOrEqual(2);
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
  await drag(page, 110);
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: 'What should I prepare?' })).toBeVisible();
  await expect(accept(page)).toHaveCount(0);
  await expectXP(page, 0);
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
  await accept(page).click();
  await expect(page.getByRole('heading', { name: 'Preparing preview result' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel preview job' }).click();
  await expect(dialog(page)).toContainText(/Acceptance XP kept/i);
  await expectXP(page, 10);
  await back(page).click();
  await choice.click();
  await expect(accept(page)).not.toContainText('+10');
  await accept(page).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await expect(dialog(page)).toContainText(/prepared in this preview.*nothing was sent/i);
  await close(page).click();
  await page.getByRole('button', { name: /^Open Open Loops/ }).click();
  await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
  await expectXP(page, 10);
});

test('secondary screens share one fixed top-left Back; source actions need separate approval', async ({
  page,
}) => {
  await openReady(page);
  await page.getByRole('button', { name: /Next step/ }).click();
  const origin = await back(page).boundingBox();
  const closeOrigin = await close(page).boundingBox();
  const panel = await dialog(page).boundingBox();
  expect(origin.x).toBeLessThan(panel.x + panel.width / 3);
  expect(Math.abs(origin.y - closeOrigin.y)).toBeLessThanOrEqual(2);
  async function fixedBack() {
    await expect(back(page)).toHaveCount(1);
    const position = await back(page).boundingBox();
    expect(Math.abs(position.x - origin.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(position.y - origin.y)).toBeLessThanOrEqual(2);
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

test.describe('narrow touch surface', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('touch swipe reaches choices, mute survives reopening, and 320px remains contained', async ({
    page,
  }) => {
    await openReady(page);
    const narrowCard = await card(page).boundingBox();
    expect(Math.abs(narrowCard.height - (narrowCard.width * 7) / 5)).toBeLessThanOrEqual(2);
    await expectCardClearance(page);
    await page.getByRole('button', { name: 'Mute sounds', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Unmute sounds' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const box = await card(page).getByRole('heading').boundingBox();
    const client = await page.context().newCDPSession(page);
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (const offset of [12, 35, 65, 110]) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x - offset, y: point.y }],
      });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await client.detach();
    await expect(page.getByRole('heading', { name: 'When should this return?' })).toBeVisible();
    await expectXP(page, 0);
    await close(page).tap();
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
    await expectCardClearance(page);
    await page.setViewportSize({ width: 320, height: 700 });
    const shortCard = await card(page).boundingBox();
    expect(Math.abs(shortCard.height - (shortCard.width * 7) / 5)).toBeLessThanOrEqual(2);
    await expectCardClearance(page);
    await page.getByRole('button', { name: /Next step/ }).tap();
    await page.getByRole('button', { name: /Draft a question for Maya/ }).tap();
    await accept(page).tap();
    await expect(page.getByRole('heading', { name: 'Draft ready' })).toBeVisible();
    await expectXP(page, 10);
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
