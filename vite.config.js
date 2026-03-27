import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  let version = '0.0.0';

  if (isBuild) {
    if (existsSync('./version.json')) {
      const versionJson = JSON.parse(readFileSync('./version.json', 'utf-8'));
      version = versionJson.version;
    }
  }

  return {
    build: {
      outDir: 'build',
      emptyOutDir: false, // We want to preserve the manifest.json
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/main.js'),
          style: resolve(__dirname, 'src/style.scss')
        },
        output: {
          entryFileNames: `[name]-${version}.js`,
          chunkFileNames: `[name]-${version}.js`,
          assetFileNames: `[name]-${version}.[ext]`
        }
      }
    }
  };
});
