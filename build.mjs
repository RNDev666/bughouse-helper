// Usage: node build.mjs <chrome|firefox> [--watch]
import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { existsSync, watch } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

/** Each part is optional: delete its folder under src/ (and its manifest key) to drop it. */
const PARTS = ['background', 'content', 'popup', 'options'];

/** Chrome rejects SVG icons, so every size is rasterised from the one SVG source. */
const ICON_SIZES = [16, 32, 48, 96, 128];

const target = process.argv[2] ?? 'chrome';
if (!['chrome', 'firefox'].includes(target)) {
  throw new Error(`Unknown target "${target}". Use "chrome" or "firefox".`);
}
const outdir = `dist/${target}`;
const isWatch = process.argv.includes('--watch');

async function bundleScripts() {
  const parts = PARTS.filter((part) => existsSync(`src/${part}/index.ts`));
  await build({
    entryPoints: parts.map((part) => ({ in: `src/${part}/index.ts`, out: part })),
    bundle: true,
    outdir,
    // ponytail: iife, not esm — works as a Chrome service worker, a Firefox event-page
    // classic script and a content script without touching the manifest.
    format: 'iife',
    target: 'es2022',
    minify: process.env.NODE_ENV === 'production',
    logLevel: 'warning',
  });
  return parts;
}

/**
 * Copies everything that isn't TypeScript (HTML, CSS, images) next to the bundles.
 * @param {string[]} parts
 */
async function copyStatic(parts) {
  for (const part of parts) {
    for (const file of await readdir(`src/${part}`)) {
      if (!file.endsWith('.ts')) await cp(`src/${part}/${file}`, `${outdir}/${file}`, { recursive: true });
    }
  }
  if (existsSync('src/shared/base.css')) await cp('src/shared/base.css', `${outdir}/base.css`);
}

async function renderIcons() {
  await mkdir(`${outdir}/icons`, { recursive: true });
  await Promise.all(
    ICON_SIZES.map(async (size) => {
      // Render at 3x then downsample, so the 16px icon keeps clean edges.
      const png = await sharp('assets/icon.svg', { density: 72 * 3 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
      await writeFile(`${outdir}/icons/icon-${size}.png`, png);
    }),
  );
}

/** manifest.json + manifest.<target>.json, with the version taken from package.json. */
async function writeManifest() {
  const readJson = async (/** @type {string} */ file) =>JSON.parse(await readFile(file, 'utf8'));
  const [base, overrides, pkg] = await Promise.all([
    readJson('manifest.json'),
    readJson(`manifest.${target}.json`),
    readJson('package.json'),
  ]);
  // ponytail: shallow merge — an override key replaces the base key wholesale.
  const manifest = { ...base, ...overrides, version: pkg.version };
  await writeFile(`${outdir}/manifest.json`, JSON.stringify(manifest, null, 2));
}

async function buildOnce() {
  await mkdir(outdir, { recursive: true });
  const parts = await bundleScripts();
  await Promise.all([copyStatic(parts), renderIcons()]);
  // Written last: in watch mode web-ext reloads the extension when this file changes.
  await writeManifest();
  console.log(`Built ${outdir} (${parts.join(', ')})`);
}

/** Rebuilds on every source change and runs the browser with the extension loaded. */
function startDevLoop() {
  let pending = Promise.resolve();
  /** @type {NodeJS.Timeout | undefined} */
  let debounce;
  const rebuild = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      // Chained so two quick saves never run overlapping builds.
      pending = pending.then(buildOnce).catch((error) => console.error(error.message));
    }, 100);
  };
  for (const path of ['src', 'assets', 'manifest.json', `manifest.${target}.json`, 'package.json']) {
    watch(path, { recursive: true }, rebuild);
  }

  const webExt = spawn(
    process.execPath,
    [
      'node_modules/web-ext/bin/web-ext.js',
      'run',
      '--source-dir', outdir,
      // Absolute: web-ext's file watcher silently ignores relative paths.
      '--watch-file', resolve(outdir, 'manifest.json'),
      '--target', target === 'chrome' ? 'chromium' : 'firefox-desktop',
      // Anything else on the command line goes to web-ext: `npm run dev:firefox -- --devtools`
      ...process.argv.slice(3).filter((arg) => arg !== '--watch'),
    ],
    { stdio: 'inherit' },
  );
  webExt.on('exit', (code) => process.exit(code ?? 0));
}

// Watch mode keeps the directory so the running browser never sees it vanish; a removed
// part's old files linger until the next clean build.
if (!isWatch) await rm(outdir, { recursive: true, force: true });
await buildOnce();
if (isWatch) startDevLoop();
