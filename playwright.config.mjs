import { defineConfig } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const previewRoot = resolve(directory, process.env.PREVIEW_ROOT || 'previews');
const port = Number(process.env.PREVIEW_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;

// Serve the same files locally and in CI, without a framework or write endpoints.
if (process.argv.includes('--serve')) {
  const root = await realpath(previewRoot);
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
  };
  createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, baseURL).pathname);
      const file = await realpath(resolve(root, `.${pathname}`));
      if (!file.startsWith(`${root}${sep}`)) {
        response.writeHead(403).end();
        return;
      }
      const bytes = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch {
      response.writeHead(404).end();
    }
  }).listen(port, '127.0.0.1');
}

export default defineConfig({
  testDir: './tests',
  testMatch: 'ui.spec.mjs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1000, height: 900 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `"${process.execPath}" "${fileURLToPath(import.meta.url)}" --serve`,
    url: `${baseURL}/open-loops.html`,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
