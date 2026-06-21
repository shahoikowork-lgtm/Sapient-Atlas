import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Root dir with a trailing slash, e.g. /Users/.../Sapient-Atlas/
const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Resolve the project's "@/..." imports, and swap Next's server runtime for a
    // tiny shim so route handlers can be imported and called as plain functions.
    // The "@" alias is a regex so it only matches "@/..." and never "@anthropic-ai/*".
    alias: [
      { find: 'next/server', replacement: `${root}tests/shims/next-server.ts` },
      { find: /^@\/(.*)$/, replacement: `${root}$1` },
    ],
  },
})
