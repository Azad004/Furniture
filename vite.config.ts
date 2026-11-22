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

  return {
    // Supports explicit GitHub Pages repo base path via VITE_BASE_PATH and defaults to
    // relative './' so built JS, CSS, and static assets resolve cleanly at any subpath.
    base,
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ and adds GitHub Pages support files
      // (.nojekyll + 404.html) so root/relative asset URLs resolve in production builds.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(ROOT_DIR, 'dist');
          const srcAssets = path.resolve(ROOT_DIR, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          if (fs.existsSync(distDir)) {
            fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');
            const indexHtml = path.join(distDir, 'index.html');
            const notFoundHtml = path.join(distDir, '404.html');
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
