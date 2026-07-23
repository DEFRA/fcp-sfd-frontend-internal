# fcp-sfd-frontend-internal

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)

Frontend service for the Single Front Door (SFD) service. This service provides the user interface for internal users to interact with the SFD service.

## Prerequisites

- Docker
- Docker Compose
- Node.js (v24 LTS)

## Setup

Clone the repository and install dependencies:
```
git clone https://github.com/DEFRA/fcp-sfd-frontend-internal.git
cd fcp-sfd-frontend-internal
npm install
```

## Configuration

Check out [.env.example](/.env.example) for details of the required things you'll need in your `.env` file. Contact the SFD dev team if you are unsure of the values you need to use.

## Authentication

This service supports two authentication methods for Entra ID integration:

### Legacy: Client Secret (OAuth 2.0)

The default authentication method uses a client secret for Entra ID integration. Configuration:

```env
ENTRA_TENANT_ID=<your-tenant-id>
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_CLIENT_SECRET=<your-client-secret>
ENTRA_WELL_KNOWN_URL=<well-known-url>
ENTRA_REDIRECT_URL=<redirect-url>
ENTRA_SIGN_OUT_REDIRECT_URL=<sign-out-url>
USE_FEDERATED_CREDENTIALS=false
```

### Modern: Federated Credentials (Workload Identity)

For deployments on the Core Delivery Platform (CDP), federated credentials eliminate the need to store and rotate client secrets. This method uses AWS STS Web Identity tokens for secure, short-lived authentication.

#### Prerequisites

1. Entra ID Application Registration must have a federated credential configured
2. Service must be running on CDP (AWS STS Web Identity tokens are auto-provisioned)
3. Environment must have the `CDP_JWT_ISSUER` variable set by the platform

#### Setup

1. Enable federated credentials via feature toggle:
   ```env
   USE_FEDERATED_CREDENTIALS=true
   ```

2. Configure the federated credential audience (should match the value configured in Entra):
   ```env
   ENTRA_FEDERATED_AUDIENCE=<audience-value>
   ```

3. Optionally use mock provider for local development:
   ```env
   ENTRA_FEDERATED_MOCK=true
   ```

4. (Development only) Allow insecure HTTP for OIDC discovery:
   ```env
   ENTRA_OIDC_USE_HTTP=true
   ```
   The service fetches security configuration from Azure's OIDC discovery endpoint when starting up. By default, it requires HTTPS (secure). For local development, this setting allows HTTP (insecure) connections instead. This is only needed if your local mock server or development environment runs on HTTP. **Never set this to `true` in production** — production deployments must always use HTTPS.

#### Example Configuration

Development (with mock):
```env
USE_FEDERATED_CREDENTIALS=true
# (no ENTRA_FEDERATED_ENABLED flag; USE_FEDERATED_CREDENTIALS controls the auth mode)
ENTRA_FEDERATED_AUDIENCE=sfd-internal
ENTRA_FEDERATED_MOCK=true
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_TENANT_ID=<your-tenant-id>
ENTRA_WELL_KNOWN_URL=<well-known-url>
ENTRA_OIDC_USE_HTTP=true
```

Production (on CDP):
```env
USE_FEDERATED_CREDENTIALS=true
ENTRA_FEDERATED_ENABLED=true
ENTRA_FEDERATED_AUDIENCE=sfd-internal
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_TENANT_ID=<your-tenant-id>
ENTRA_WELL_KNOWN_URL=<well-known-url>
```

#### How It Works

1. Service requests a short-lived JWT from AWS STS Web Identity endpoint
2. JWT is presented to Entra ID as a `client_assertion`
3. Entra validates JWT signature and grants an access token
4. Service uses access token for downstream API calls
5. Tokens are automatically refreshed before expiry

No client secrets are stored, rotated, or distributed.

#### Migration from Client Secrets

To migrate from client secrets to federated credentials:

1. Ensure Entra Application Registration has federated credentials configured for all environments
2. Deploy new code with `USE_FEDERATED_CREDENTIALS=false` (existing flow continues to work)
3. In a lower environment, set `USE_FEDERATED_CREDENTIALS=true` and `ENTRA_FEDERATED_AUDIENCE=<audience>`
4. Verify authentication works in lower environment
5. Gradually roll out through higher environments
6. Once confident, keep `USE_FEDERATED_CREDENTIALS=true` in all environments
7. Optionally request deletion of client secrets from Entra (after rollback safety window)

#### Rollback

If issues occur after enabling federated credentials:

1. Set `USE_FEDERATED_CREDENTIALS=false`
2. Deploy
3. Service automatically falls back to client secret authentication
4. Existing client secrets must remain configured for fallback to work



You can either run this service independently or alternatively run the [fcp-sfd-core](https://github.com/DEFRA/fcp-sfd-core) repository for local development if you need to run more services simultaneously.

### Building the Docker image

Container images are built using Docker Compose. It's important to note that in order to successfully run the [fcp-dal-api](https://github.com/defra/fcp-dal-api) and its [upstream-mock](https://github.com/defra/fcp-dal-upstream-mock) to interact with the Data Access Layer (DAL), you _must_ run this service as a Docker container. This is because the [Docker Compose configuration](./compose.yaml) for this repository pulls and runs the Docker images for the `fcp-dal-api` and `fcp-dal-upstream-mock` (a.k.a. the DAL or Kits mock) from the Docker registry.

First, build the Docker image:
```
docker compose build
```

### Starting the Docker container

After building the image, run the service locally in a container alongside `fcp-dal-api` and `fcp-dal-upstream-mock`:
```
docker compose up
```
Use the `-d` at the end of the above command to run in detached mode e.g. if you wish to view logs in another application such as Docker Desktop.

You can find further information on how SFD integrates with the DAL on [Confluence](https://eaflood.atlassian.net/wiki/spaces/SFD/pages/5712838853/Single+Front+Door+Integration+with+Data+Access+Layer).

### Running with a local upstream mock

If you need to modify mock responses or the upstream deployed environments are unavailable, you can build `fcp-dal-upstream-mock` from a local checkout instead of using the published Docker image.

1. Clone the upstream mock repository:
   ```
   git clone https://github.com/DEFRA/fcp-dal-upstream-mock.git
   ```
2. Add the path to your `.env` file:
   ```
   DAL_UPSTREAM_MOCK_LOCAL_PATH=/path/to/fcp-dal-upstream-mock
   ```
3. Start the stack using the local mock:
   ```
   npm run docker:dal-local
   ```

> **Note:** a VS Code task for running the local mock is provided by [`fcp-sfd-dev-environment`](https://github.com/DEFRA/fcp-sfd-dev-environment) — see the **🧪🔧 Up Frontend internal with local DAL mock** task.

### Accessing the application

The application will be available at http://localhost:3006.

## Tests

### Running tests

Run the tests with:

```
npm run docker:test
```
Or to run the tests in watch mode:
```
npm run docker:test:watch
```

## Local engine development

If you are working on [`fcp-sfd-frontend-engine`](https://github.com/DEFRA/fcp-sfd-frontend-engine) alongside this service, you can mount your local engine build directly into the container without changing `package.json`.

### Prerequisites

The `fcp-sfd-frontend-engine` repository must be cloned as a sibling of this one (i.e. both under the same parent directory).

### Workflow

1. In the engine repo, start the TypeScript watch build:
   ```
   npx tsup --watch
   ```
   This continuously rebuilds the engine `dist/` folder when source files change.

2. Start this service using the engine overlay:
   ```
   docker compose -f compose.yaml -f compose.override.yaml -f compose.link-engine.yaml up --build
   ```
   The overlay mounts the engine's local `dist/` and `package.json` into the container and configures nodemon to restart the server whenever the engine rebuilds.

> **Note:** VS Code tasks for both of the above steps are provided by [`fcp-sfd-dev-environment`](https://github.com/DEFRA/fcp-sfd-dev-environment) — see the **"🔨 Watch and Rebuild Engine"** and **"🔗 Up Frontend internal with local Engine"** tasks.

## Server-side Caching

We use Catbox for server-side caching. By default, the service will use CatboxRedis when deployed and CatboxMemory for local development. You can override the default behavior by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or `memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each instance of the service and it will not persist between restarts.

## SonarQube Cloud scan

Run a local scan against [SonarCloud](https://sonarcloud.io/project/overview?id=DEFRA_fcp-sfd-frontend-internal) for the current git branch. See the [DEFRA SonarCloud guide](https://github.com/DEFRA/cdp-documentation/blob/main/how-to/sonarcloud.md) for organisation access and CI setup.

### Setup

1. Log in to [SonarQube Cloud](https://sonarcloud.io) with your DEFRA GitHub account
2. Go to **My Account → Security → Generate Tokens** and create a personal token
3. Add `SONAR_TOKEN=<your-token>` to your `.env` file
4. Ensure Docker is running

### Run

Generate test coverage first, then scan:

```bash
npm run docker:test
npm run sonar
```

The script uploads results for the current branch and prints:

- Quality gate pass/fail and failed conditions
- Open issues on new code (when the gate fails)
- **Accepted / false-positive issues without comment** — DEFRA quality gates require a justification comment on each suppressed issue; add comments in SonarCloud under the issue **Activity** tab

Exit code is `0` when the gate passes and all suppressed issues are commented, `1` otherwise.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of His Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
