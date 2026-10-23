import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { extractAssets } from './import-preview.mjs';

// HTML and asset bytes are the importer's public serialized output contract.
test('extracted classic scripts preserve execution order and retain JSON data', () => {
  const source =
    '<script>globalThis.value = 2;</script><script type="application/json">{"fixture":true}</script><script>globalThis.value += 3;</script>';
  const result = extractAssets(source, 'companion');
  const context = {};
  for (const asset of result.assets) runInNewContext(asset.content, context);
  assert.equal(context.value, 5);
  assert.deepEqual(
    result.assets.map((asset) => asset.path),
    ['assets/companion.js', 'assets/companion-2.js'],
  );
  assert.ok(result.html.includes('<script type="application/json">{"fixture":true}</script>'));
  assert.ok(
    result.html.indexOf('assets/companion.js') < result.html.indexOf('assets/companion-2.js'),
  );
});

test('relocated CSS preserves media and resolves local resources relative to HTML', () => {
  const result = extractAssets(
    '<style media="print">@import "theme.css";a{background:url("images/a.png")}b{background:url(data:image/png;base64,abc)}</style>',
    'day',
  );
  assert.equal(result.html, '<link rel="stylesheet" media="print" href="assets/day.css">');
  assert.ok(result.assets[0].content.includes('@import "../theme.css"'));
  assert.ok(result.assets[0].content.includes('url("../images/a.png")'));
  assert.ok(result.assets[0].content.includes('url(data:image/png;base64,abc)'));
});

test('existing external scripts remain external; relative module imports require review', () => {
  assert.equal(extractAssets('<script src="vendor.js"></script>', 'page').assets.length, 0);
  assert.throws(
    () => extractAssets('<script type="module">import "./relative.js";</script>', 'page'),
    /explicit path review/,
  );
  assert.throws(
    () => extractAssets('<script type="module">import("./relative.js");</script>', 'page'),
    /explicit path review/,
  );
});
