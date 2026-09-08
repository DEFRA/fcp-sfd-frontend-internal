# Copilot instructions: fcp-sfd-frontend-internal

## What this is

Frontend service for the Single Front Door (SFD) on Defra's Future Farming and Countryside Programme. A Hapi.js server with Nunjucks templates using GOV.UK Frontend, serving **internal staff and caseworkers** who look up and manage a customer's business and personal details on their behalf. Data flows through the DAL (`fcp-dal-api`) via GraphQL to Rural Payments (KITS) upstream services.

`fcp-sfd-frontend` is the sibling service for farmers and land managers. This service is being built to mirror it, with shared code moving into `@defra/fcp-sfd-frontend-engine` (see [Shared engine](#shared-engine)).

## Stack

- Node **>= 24**, ESM (`"type": "module"`) throughout — use `import`/`export`, file extensions required (`./file.js`).
- Hapi 21, Nunjucks + GOV.UK Frontend, Webpack (client assets), convict (config), Joi (validation).
- Session: `@hapi/yar` over Catbox (Redis in prod, memory locally).
- Auth: **Microsoft Entra ID** via OpenID Connect — `@hapi/bell` (`entra` strategy) for sign-in, `@hapi/cookie` (`session` strategy) for every subsequent request.
- Tests: Vitest. Lint: **neostandard** (via eslint) + stylelint. No semicolons, 2-space indent.
- Platform: deployed on Defra CDP. Outbound HTTP goes through a proxy — `global-agent` bootstrapped in `src/utils/setup-proxy.js`, `https-proxy-agent` configured in `src/utils/proxy.js` — and CDP secure context (`src/plugins/secure-context/`); metrics via `aws-embedded-metrics` (`src/utils/metrics.js`), tracing via `@defra/hapi-tracing`.

## Commands

**Everything runs in Docker.** The service can't run standalone — it depends on other services (DAL, upstream-mock, Redis, Mongo) that come up together via `docker compose`. Do not suggest host `npm run dev` / `npm start` / `npm run build`; they won't produce a working app on their own.

Prefer running common workflows via VS Code tasks where available (for example Up Frontend internal, Test Frontend internal, Watch Test Frontend internal, Lint Frontend internal). If no task fits, use the explicit commands below.

- `docker compose up` (or `npm run docker:dev`) — run the full stack (frontend internal + all dependencies)
- `npm run docker:debug` — full stack with the Node debugger attached
- `npm run docker:dal-local` — full stack against a local `fcp-dal-upstream-mock` checkout
- `npm run docker:test` — **run the full test suite (see Testing)**
- `npm run docker:test:watch` — full test suite in watch mode
- `npm run lint` / `npm run lint:fix` — neostandard + stylelint / auto-fix (the one thing safe to run on the host)

## Architecture

### Request lifecycle

`Routes → Services → DAL connector → fcp-dal-api (GraphQL) → KITS upstream`

- **Routes** (`src/routes/`): Hapi route definitions with GET/POST handlers, organised by domain (`search/`, `overview/`, `customer/`, `business/`, `auth/`, `footer/`, `errors/`) plus top-level health, index, signed-out and static-asset routes. All are collected in `src/routes/routes.js` and registered by the `router` plugin. Keep handlers thin — delegate to services.
- **Services** (`src/services/`): Business logic. Fetch data, orchestrate mutations, manage session state. Grouped by domain (`business/`, `personal/`, `search/`, `overview/`, `os-places/`, `DAL/`) plus shared services at the root.
- **DAL** (`src/dal/`): GraphQL connector singleton initialised at server startup. Queries live locally in `queries/` (including `queries/overview/`); there is **no local `mutations/` folder** — every mutation is imported from `@defra/fcp-sfd-frontend-engine`.
- **Presenters** (`src/presenters/`): Transform data for view rendering, organised by domain. `base-presenter.js` holds shared formatting (addresses, phone numbers, back links); `pagination-presenter.js` and `signed-out-presenter.js` are internal-only.
- **Mappers** (`src/mappers/`): Transform DAL responses into domain objects used by services/presenters. Several wrap engine mappers.
- **Schemas** (`src/schemas/`): Local Joi validation for the search journey (`schemas/search/`). Form payload schemas are shared, so they live in the engine and are used as `schemas.<domain>.<field>`.
- **Views** (`src/views/`): Nunjucks templates, organised by domain (`business/`, `personal/`, `overview/`, `search/`, `errors/`, `footer/`). `common/` holds the layout and shared partials (navigation, sub-header, phase banner, contact, heading).
- **Plugins** (`src/plugins/`): Hapi server assembly, registered from `src/plugins/index.js` — CSRF (`@hapi/crumb`), auth strategies (`auth/`), security (`content-security-policy.js`, `headers.js`, `secure-context/`), session, request logging/tracing, error handling, template rendering (`template-renderer/`) and routing (`router.js`).
- **Auth helpers** (`src/auth/`): Entra / OIDC support — OIDC config discovery, token verification and refresh, OAuth state validation, sign-out URL.

### Key patterns

- **DAL connector**: singleton initialised in `src/server.js` via `initDalConnector(server.app.tokenCache)`; services access it via `getDalConnector()`. Call it as `dalConnector.query(query, variables, email)` — the connector attaches the M2M bearer token and forwards the caseworker's `email` header, which is how the internal DAL gateway identifies the acting user.
- **Credentials**: the cookie session holds `{ sessionId, email, scope, token, refreshToken, ... }` on `auth.credentials`, populated in `src/routes/auth/client-secret-routes.js` from the Entra profile. Routes read `auth.credentials?.email` and pass only that down to services.
- **CRN and SBI come from the URL**, not the signed-in user — staff reach a record via search (`/customer/{crn}`, `/business/{sbi}`).
- **Pre-handlers** (`src/routes/pre-handlers.js`): `validateCrn` / `validateSbi` guard the URL parameter; `checkCrnAndInterrupterJourney(journey)` / `checkSbiAndInterrupterJourney(journey)` also assert the interrupter journey session before allowing a fix route.
- **Cache**: session cache via `request.server.app.cache` — `.get(sessionId)` / `.set(sessionId, data, ttl)`. Re-fetch from DAL on cache miss. `server.app.tokenCache` is a separate cache for DAL M2M tokens.
- **Change/Fix journeys**: two-phase pattern — "change" routes let staff edit one field; "fix" routes (interrupters) force invalid data to be corrected before proceeding. Both are behind feature toggles.
- **Search and overview**: `src/routes/search/` handles SBI/CRN lookup and changing the search criteria. The customer and business overview pages page their contents using `src/presenters/pagination-presenter.js` and `src/constants/pagination.js`.
- **Address lookup**: postcode/address search via OS Places (`src/services/os-places/address-lookup-service.js`); a stub is used when `OS_PLACES_STUB=true`.
- **Flash notifications**: one-shot confirmation banners shown after a successful change via `src/utils/notifications/flash-notification.js` (session-backed, cleared on read).
- **Feature toggles**: boolean env vars via `src/config/feature-toggle.js` (convict) — `USE_DAL_TEST_EMAIL`, `PERSONAL_DETAILS_INTERRUPTER_ENABLED`, `BUSINESS_DETAILS_INTERRUPTER_ENABLED`, `USE_FEDERATED_CREDENTIALS`.
- **Config**: convict with strict validation, split across `src/config/` by concern (`server`, `entra`, `dal`, `redis`, `nunjucks`, `os-places`, `logger-options`, `navigation-items`, `feature-toggle`). Read with `config.get('path.to.value')`. See `.env.example`.
- **Errors**: throw Boom errors in routes (`Boom.badRequest()`, `Boom.notFound()`). Two separate `onPreResponse` extensions handle them: one registered in `src/plugins/errors.js` (403 → `unauthorised`, 404 → `errors/page-not-found`, otherwise `errors/service-problem`), and another (`catchAll`) registered directly in `src/server.js` from `src/utils/errors.js`.

### Client-side assets

Webpack bundles `src/client/` → `.public/`. Entry points: `src/client/javascripts/application.js` + `src/client/stylesheets/application.scss`. GOV.UK Frontend assets are copied in; asset manifest is used for cache-busting in production.

## Testing

**Always run tests in Docker: `npm run docker:test`.** Host `vitest` / `npm test` runs fail — integration tests need dependent services (DAL API, upstream-mock, Redis) that only `compose.test.yaml` provides. Watch mode: `npm run docker:test:watch`.

- **Unit tests** (`test/unit/`): mirror `src/` structure. Pure logic with `vi.mock`.
- **Integration tests** (`test/integration/narrow/`): spin up a real Hapi server (Redis mocked to CatboxMemory). Use `server.inject()` to test routes end-to-end. Import `test/mocks/setup-server-mocks.js` for OIDC/Redis stubbing.
- Test files must match `**/test/**/*.test.js`.

## Shared engine

`@defra/fcp-sfd-frontend-engine` holds code shared between `fcp-sfd-frontend` and `fcp-sfd-frontend-internal`. This (internal, staff) service is being built to mirror the external (customer) one, with shared logic progressively extracted into the engine rather than duplicated. When adding or refactoring logic that exists in both services, prefer moving it into the engine.

- **Belongs in the engine** (generic, not tied to either service): Joi schemas, DAL queries and mutations, utility functions, presenter utils and mappers.
- **Must NOT go in the engine**: routes, authentication logic, anything coupled to request/response handling, and complex orchestration that needs back-and-forth between services.
- **Deliberate differences — do not unify these in the engine**: this service uses **Microsoft Entra** auth and the internal DAL gateway (acting user's email in the request header), and reaches records by CRN/SBI search; the external service uses **Defra ID** and an external gateway (Defra ID token) scoped to the signed-in customer.

## Common tasks

- **New service**: `src/services/{domain}/<verb>-<domain>-<field>-service.js`.
- **New route**: `src/routes/{domain}/{domain}-{field}-{change|check}-routes.js`, registered in `src/routes/routes.js`.
- **New DAL query**: add generic GraphQL queries to `@defra/fcp-sfd-frontend-engine`, then import the engine export in the service and call `dalConnector.query(query, variables, email)`.
- **Guarding a new fix route**: add the journey to `src/constants/journeys.js` and apply the matching `check*AndInterrupterJourney` pre-handler.

## References

- Hapi — https://hapi.dev/
- GOV.UK Frontend / Design System — https://design-system.service.gov.uk/
- Environment config — `.env.example`
