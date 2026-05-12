import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'workbox-window': new URL('./tools/empty-module.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    mockReset: true,
    setupFiles: ['./tools/setup-tests.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    server: {
      deps: {
        inline: [/@openmrs/, 'workbox-window'],
      },
    },
    alias: {
      '@openmrs/esm-framework/src/internal': '@openmrs/esm-framework/mock',
      '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
      'react-i18next': new URL('./__mocks__/react-i18next.js', import.meta.url).pathname,
    },
  },
});
