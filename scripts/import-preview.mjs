import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const digest = (content) => createHash('sha256').update(content).digest('hex');

export function extractAssets(html, name) {
  const assets = [];
  let scripts = 0;
  let styles = 0;
  let output = html.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
    (tag, attributes, content) => {
      if (/\bsrc\s*=/i.test(attributes) || !content.trim()) return tag;
      const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      if (
        type &&
        !['module', 'text/javascript', 'application/javascript'].includes(type.toLowerCase())
      )
        return tag;
      const extension = type === 'module' ? 'mjs' : 'js';
      const suffix = ++scripts === 1 ? '' : `-${scripts}`;
      const path = `assets/${name}${suffix}.${extension}`;
      if (type === 'module' && /(?:from\s*|import\s*(?:\(\s*)?)["']\.{1,2}\//.test(content)) {
        throw new Error(
          'Relative inline module imports require explicit path review before extraction',
        );
      }
      assets.push({ path, content });
      return `<script${attributes} src="${path}"></script>`;
    },
  );
  output = output.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi,
    (_tag, attributes, content) => {
      const suffix = ++styles === 1 ? '' : `-${styles}`;
      const path = `assets/${name}${suffix}.css`;
      let relocated = content.replace(
        /url\(\s*(["']?)([^"')\s]+)\1\s*\)/gi,
        (value, quote, url) => {
          if (/^(?:[a-z]+:|\/|#)/i.test(url)) return value;
          return `url(${quote}../${url}${quote})`;
        },
      );
      relocated = relocated.replace(
        /(@import\s+)(["'])(?![a-z]+:|\/|#)([^"']+)\2/gi,
        (_value, prefix, quote, path) => `${prefix}${quote}../${path}${quote}`,
      );
      assets.push({ path, content: relocated });
      return `<link rel="stylesheet"${attributes} href="${path}">`;
    },
  );
  return { html: output, assets };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination)
    throw new Error('Usage: node scripts/import-preview.mjs INPUT.html OUTPUT.html');
  if (existsSync(destination))
    throw new Error(`Refusing to overwrite existing preview: ${destination}`);
  const original = readFileSync(source, 'utf8');
  const result = extractAssets(original, basename(destination, '.html'));
  mkdirSync(dirname(destination), { recursive: true });
  for (const asset of result.assets) {
    const path = join(dirname(destination), asset.path);
    if (existsSync(path)) throw new Error(`Refusing to overwrite existing asset: ${path}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, asset.content);
  }
  writeFileSync(destination, result.html);
  console.log(
    JSON.stringify(
      {
        source: basename(source),
        source_sha256: digest(original),
        destination: resolve(destination),
        destination_sha256: digest(result.html),
        transformation:
          'Inline executable JavaScript and CSS extracted; local CSS URLs rebased; not byte-identical',
        assets: result.assets.map((asset) => ({ path: asset.path, sha256: digest(asset.content) })),
      },
      null,
      2,
    ),
  );
}
