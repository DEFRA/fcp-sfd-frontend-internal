import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/test/**/*.test.js'],
    timeout: 10000,
    hookTimeout: 10000,
    coverage: {
      reportOnFailure: true,
      clean: false,
      reporter: ['lcov'],
      include: ['src/**/*.js'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '.server',
        'src/index.js'
      ]
    }
  }
})
