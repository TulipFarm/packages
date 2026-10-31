import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { loadCatalog } from '../src/lib/catalog.ts';

const execute = promisify(execFile);
const root = process.cwd();
const origin = 'https://packages.tulipfarm.ai';
const entries = await loadCatalog();
const built = path => readFile(resolve(root, 'dist', path.replace(/^\//, '')), 'utf8');
const indexable =
  process.env.SITE_INDEXING === 'true' && (!process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH === 'main');

test('public feed and version endpoints preserve the validated source bytes', async () => {
  const feed = JSON.parse(await built('catalog.json'));
  assert.equal(feed.packages.length, entries.length);
  for (const entry of entries) {
    const item = feed.packages.find(candidate => candidate.name === entry.slug && candidate.version === entry.version);
    assert.ok(item, entry.slug);
    assert.equal(item.title, entry.document.package.title);
    assert.equal(item.page, entry.detailPath);
    assert.equal(item.url, entry.downloadPath);
    assert.equal(await built(item.url), entry.raw);
  }
});

test('details expose real resource groups and exact package chat links without JavaScript', async () => {
  for (const entry of entries) {
    const html = await built(`${entry.detailPath}index.html`);
    const anchor = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find(match =>
      match[2].includes('Install to workspace'),
    );
    assert.ok(anchor, entry.slug);
    const destination = new URL(anchor[1].match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&'));
    assert.equal(destination.origin, 'https://app.tulipfarm.ai');
    assert.equal(destination.pathname, '/_chat');
    assert.deepEqual(Object.fromEntries(destination.searchParams), {
      intent: 'install-package',
      packageName: entry.slug,
      packageVersion: entry.version,
    });
    assert.doesNotMatch(anchor[1], /\b(?:disabled|aria-disabled)/);
    assert.doesNotMatch(html, /Install link not available yet/);
    for (const resource of entry.resources) {
      assert.ok(html.includes(`contents-${resource.kind}`), `${entry.slug}: ${resource.kind}`);
    }
    assert.doesNotMatch(html, /PlanOutline|Download JSON|templates/i);
    assert.match(html, /data-theme-toggle/);
  }
});

test('canonical metadata, structured data and social images exist for every public page', async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const path of ['/', ...entries.map(entry => entry.detailPath)]) {
    const html = await built(`${path}index.html`);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}"`), path);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    const robots = html.match(/name="robots" content="([^"]+)"/)?.[1];
    assert.equal(robots, indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow');
    titles.add(html.match(/<title>(.*?)<\/title>/)?.[1]);
    descriptions.add(html.match(/name="description" content="([^"]+)"/)?.[1]);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '');
    assert.equal(graph['@context'], 'https://schema.org');
    assert.ok(Array.isArray(graph['@graph']));
    const image = new URL(html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? '');
    assert.equal(image.origin, origin);
    const bytes = await readFile(join(root, 'dist', image.pathname));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
  }
  assert.equal(titles.size, entries.length + 1);
  assert.equal(descriptions.size, entries.length + 1);
  const sitemap = await built('sitemap.xml');
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, indexable ? entries.length + 1 : 0);
  assert.match(await built('robots.txt'), indexable ? /Allow: \// : /Disallow: \//);
  const missing = await built('404.html');
  assert.match(missing, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(missing, /rel="canonical"/);
});

test('deployment includes public JSON CORS and preview noindex headers', async () => {
  const headers = await built('_headers');
  for (const path of ['/catalog.json', '/packages/:slug/:version/package.json']) {
    assert.ok(headers.includes(`${path}\n  Access-Control-Allow-Origin: *`));
  }
  assert.match(headers, /https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
});

test('theme preferences override the OS with explicit Sprout markers and follow cross-tab changes', async () => {
  const html = await built('index.html');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => match[1])
    .find(source => source.includes("const storageKey = 'tulipfarm-theme'"));
  assert.ok(script);
  for (const osDark of [false, true]) {
    for (const stored of [null, 'light', 'dark']) {
      const classes = new Set();
      const media = {
        matches: osDark,
        addEventListener: (_, listener) => {
          media.change = listener;
        },
      };
      const events = {};
      let preference = stored;
      const root = {
        dataset: {},
        classList: {
          toggle: (name, enabled) => (enabled ? classes.add(name) : classes.delete(name)),
          contains: name => classes.has(name),
        },
      };
      class Toggle {
        closest() {
          return this;
        }
      }
      runInNewContext(script, {
        document: {
          documentElement: root,
          addEventListener: (name, listener) => {
            events[name] = listener;
          },
        },
        window: {
          addEventListener: (name, listener) => {
            events[name] = listener;
          },
        },
        matchMedia: () => media,
        localStorage: {
          getItem: () => preference,
          setItem: (_, value) => {
            preference = value;
          },
        },
        Element: Toggle,
      });
      const assertTheme = dark => assert.deepEqual([...classes], [dark ? 'dark' : 'light']);
      const initialDark = stored ? stored === 'dark' : osDark;
      assertTheme(initialDark);
      events.click({ target: new Toggle() });
      assertTheme(!initialDark);
      assert.equal(preference, initialDark ? 'light' : 'dark');
      media.matches = !osDark;
      media.change();
      assertTheme(!initialDark);
      events.storage({ key: 'tulipfarm-theme', newValue: 'light' });
      assertTheme(false);
      events.storage({ key: 'tulipfarm-theme', newValue: null });
      assertTheme(media.matches);
    }
  }
});

test('catalog rejects invalid identities, references, asset bytes and schema pins', async () => {
  const cases = [
    ['catalog/catalog.json', data => data.push(data[0]), /Duplicate package identities/],
    [
      'packages/leave-management/1.0.0/package.json',
      data => {
        data.package.version = '9.0.0';
      },
      /identity or license mismatch/,
    ],
    [
      'packages/leave-management/1.0.0/package.json',
      data => {
        data.outputs[0].resource.key = 'missing';
      },
      /Invalid typed reference/,
    ],
    [
      'packages/leave-management/1.0.0/package.json',
      data => {
        data.assets[0].content += '\nchanged';
      },
      /Asset integrity mismatch/,
    ],
    [
      'packages/leave-management/1.0.0/package.json',
      data => {
        delete data.requires;
      },
      /required/,
    ],
    [
      'catalog/schema-pin.json',
      data => {
        data.sha256 = '0'.repeat(64);
      },
      /Schema cache digest mismatch/,
    ],
  ];
  for (const [path, mutate, message] of cases) {
    const fixture = await mkdtemp(join(tmpdir(), 'tulipfarm-packages-test-'));
    try {
      for (const directory of ['catalog', 'packages']) {
        await cp(join(root, directory), join(fixture, directory), { recursive: true });
      }
      const file = join(fixture, path);
      const data = JSON.parse(await readFile(file, 'utf8'));
      mutate(data);
      await writeFile(file, JSON.stringify(data));
      await assert.rejects(
        execute(process.execPath, [join(root, 'scripts/validate-packages.ts')], { cwd: fixture }),
        error => {
          assert.match(error.stderr, message);
          return true;
        },
      );
    } finally {
      await rm(fixture, { recursive: true });
    }
  }
});
