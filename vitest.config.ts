import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared/src'),
      '@backend': path.resolve(__dirname, './backend/src'),
      '@frontend': path.resolve(__dirname, './frontend/src'),
    },
  },
})