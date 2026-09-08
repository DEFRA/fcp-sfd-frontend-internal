---
name: testing
description: Testing standards and conventions for this project. Use when writing tests, reviewing test changes, or asked how to test frontend behaviour.
---

# Testing skill

## Framework

- Use `vitest`.
- Import test APIs explicitly from `vitest`.
- Test files are ESM and internal imports use `.js` extensions.

## Test layout

- Test files must match `**/test/**/*.test.js`.
- Unit tests live in `test/unit/` and mirror `src/`.
- Integration tests live in `test/integration/narrow/`.
- Integration route tests use `server.inject()` and can reuse stubs from `test/mocks/setup-server-mocks.js`.

## Mocking and isolation

- Valid patterns in this repo include `vi.mock()`, `vi.doMock()`, `vi.spyOn()`, and `vi.fn()`.
- Reset or clear mocks between tests (for example `vi.clearAllMocks()`, `vi.resetModules()`, and `vi.restoreAllMocks()`).
- Never commit `describe.only()` or `it.only()`.

## Review expectations

- New or changed behaviour includes happy-path and key error-path coverage.
- Test names describe behaviour clearly.
- For review work, inspect tests first. If runtime verification is needed, ask the author to run Docker tests.

## Running tests

- Full suite in Docker: `npm run docker:test`. This lints first and runs under the `fcp-sfd-frontend-internal-test` compose project.
- Watch mode in Docker: `npm run docker:test:watch`.
- Single-file run in Docker: `docker compose down -v; docker compose -f compose.yaml -f compose.test.yaml run --rm fcp-sfd-frontend-internal npx vitest run <path-to-test-file>`.
- Do not rely on host `vitest` or `npm test` for full-suite verification.
