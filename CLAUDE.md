# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Frontend service for the Single Front Door (SFD) on DEFRA's Future Farming and Countryside Programme. It's a Hapi.js server with Nunjucks templates using GOV.UK Frontend, serving internal staff and caseworkers to view and manage farmer and land manager business and personal details. Data flows through the DAL (fcp-dal-api) via GraphQL to Rural Payments (KITS) upstream services.

## Commands

- `npm run dev` — Run locally with hot reload (webpack watch + nodemon)
- `npm run build` — Production webpack build
- `npm test` — Run all tests with coverage (vitest)
- `npm run test:watch` — Run tests in watch mode
- `npx vitest run test/unit/routes/personal/personal-email-change-routes.test.js` — Run a single test file
- `npm run lint` — Run neostandard (via eslint) + stylelint
- `npm run lint:fix` — Auto-fix neostandard issues
- `npm run docker:dev` — Run with DAL, upstream-mock, Redis, Mongo, and Entra ID stub
- `docker compose build` — Rebuild Docker image

## Architecture

### Request Lifecycle

Routes → Services → DAL Connector → fcp-dal-api (GraphQL) → KITS upstream

- **Routes** (`src/routes/`): Hapi route definitions with GET/POST handlers. Organized by domain (personal/, business/, footer/, errors/).
- **Services** (`src/services/`): Business logic layer. Fetch data, orchestrate mutations, manage session state. Grouped by domain + shared services.
- **DAL** (`src/dal/`): GraphQL connector singleton initialized at server startup. Uses closure over session/token caches. All GraphQL queries and mutations live in `queries/` and `mutations/`.
- **Presenters** (`src/presenters/`): Transform data for view rendering. `base-presenter.js` has shared formatting (addresses, phone numbers, back links).
- **Mappers** (`src/mappers/`): Transform DAL responses into domain objects used by services/presenters.
- **Schemas** (`src/schemas/`): Joi validation schemas for form payloads and DAL response shapes.
- **Views** (`src/views/`): Nunjucks templates. `common/` has shared layout partials, `components/` has reusable macros.

### Key Patterns

- **DAL Connector**: Singleton initialized in `src/server.js` via `initDalConnector()`. Services access it via `getDalConnector()`. It handles auth tokens (M2M + forwarded user token) automatically.
- **Credentials**: `{ sbi, crn, sessionId }` passed through the stack from route → service. Always pass `{ sessionId }` to `dalConnector.query()` for authenticated calls.
- **Session**: Hapi `yar` plugin backed by Catbox (Redis in prod, memory locally). Session data for multi-page forms stored via `src/utils/session/`.
- **Auth**: Entra ID (Azure AD) via OpenID Connect through `@hapi/bell`. Token refresh handled by SSO plugin. Routes use Hapi auth strategies.
- **Feature Toggles**: Boolean env vars checked via `src/config/feature-toggle.js` (convict). Currently: `useDalTestEmail` (env: `USE_DAL_TEST_EMAIL`, default false).
- **Change/Fix Journeys**: Two-phase pattern — "change" routes let users edit one field, "fix" routes (interrupters) force users to update invalid data before proceeding.
- **Config**: Uses convict with strict validation. Split across files in `src/config/` by concern.
- **Errors**: Throw Boom errors in routes (`Boom.badRequest()`, `Boom.notFound()`). Global error handler in `src/utils/errors.js`.
- **Cache**: Session cache via `request.server.app.cache`. Use `.get(sessionId)` / `.set(sessionId, data, ttl)`. Re-fetch from DAL on cache miss.

### Client-Side Assets

Webpack bundles `src/client/` → `.public/`. Entry point is `src/client/javascripts/application.js` + `src/client/stylesheets/application.scss`. GOV.UK Frontend assets are copied in. Asset manifest used for cache-busting in production.

## Testing

- **Unit tests** (`test/unit/`): Mirror `src/` structure. Pure logic tests with vi.mock.
- **Integration tests** (`test/integration/narrow/`): Spin up a real Hapi server (with Redis mocked to CatboxMemory). Use `server.inject()` to test routes end-to-end. Import `test/mocks/setup-server-mocks.js` for OIDC/Redis stubbing.
- Test files must match `**/test/**/*.test.js` pattern.

## Shared Engine

`fcp-sfd-frontend-engine` is an npm package (`@defra/fcp-sfd-frontend-engine`) that holds code shared between `fcp-sfd-frontend` and `fcp-sfd-frontend-internal`. As this service is built out to align with the external, shared logic is progressively moved into the engine rather than duplicated. When adding or refactoring logic that exists in both services, consider whether it belongs in the engine instead.

## Style

- ESM (`"type": "module"`) throughout — use `import`/`export`, not `require`.
- Neostandard for linting (no semicolons, 2-space indent).
- Node >= 24.
