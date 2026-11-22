import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const rawBase = process.env.VITE_BASE_PATH?.trim();
  const base = rawBase
    ? rawBase === '/' || rawBase === './'
      ? rawBase
      : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`
    : './';
  let resolvedOutDir = path.resolve(ROOT_DIR, 'dist');

  return {
    // Defaults to relative './' so built JS, CSS, and static assets resolve cleanly
    // on root domains, GitHub Pages project subpaths (https://user.github.io/repo/),
    // and custom domains alike.
    base,
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into the build output directory and adds GitHub Pages support
      // files (.nojekyll + 404.html) so all studio assets resolve in production builds.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        configResolved(config): void {
          resolvedOutDir = path.resolve(ROOT_DIR, config.build.outDir || 'dist');
        },
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const srcAssets = path.resolve(ROOT_DIR, 'src/assets');
          const outAssets = path.resolve(resolvedOutDir, 'src/assets');
          if (fs.existsSync(resolvedOutDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, outAssets, {recursive: true, force: true});
          }
          if (fs.existsSync(resolvedOutDir)) {
            fs.writeFileSync(path.join(resolvedOutDir, '.nojekyll'), '', 'utf8');
            const indexHtml = path.join(resolvedOutDir, 'index.html');
            const notFoundHtml = path.join(resolvedOutDir, '404.html');
            if (fs.existsSync(indexHtml)) {
              fs.copyFileSync(indexHtml, notFoundHtml);
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': ROOT_DIR,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    preview: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  };
});
