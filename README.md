# fcp-sfd-frontend-internal

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-sfd-frontend-internal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-sfd-frontend-internal)

Frontend service for the Single Front Door (SFD) service. This service provides the user interface for customers to interact with the SFD service.

## Prerequisites

- Docker
- Docker Compose
- Node.js (v22 LTS)

## Setup

Clone the repository and install dependencies:
```
git clone https://github.com/DEFRA/fcp-sfd-frontend-internal.git
cd fcp-sfd-frontend-internal
npm install
```

## Configuration

Check out [.env.example](/.env.example) for details of the required things you'll need in your `.env` file. Contact the SFD dev team if you are unsure of the values you need to use.

## Running the application

You can either run this service independently or alternatively run the [fcp-sfd-core](https://github.com/DEFRA/fcp-sfd-core) repository for local development if you need to run more services simultaneously.

### Building the Docker image

Container images are built using Docker Compose. It's important to note that in order to successfully run the [fcp-dal-api](https://github.com/defra/fcp-dal-api) and its [upstream-mock](https://github.com/defra/fcp-dal-upstream-mock) to interact with the Data Access Layer (DAL), you _must_ run this service as a Docker container. This is because the [Docker Compose configuration](./compose.yaml) for this repository pulls and runs the Docker images for the `fcp-dal-api` and `fcp-dal-upstream-mock` (a.k.a. the `kits-mock`) from the Docker registry.

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

## Server-side Caching

We use Catbox for server-side caching. By default, the service will use CatboxRedis when deployed and CatboxMemory for local development. You can override the default behavior by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or `memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each instance of the service and it will not persist between restarts.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of His Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
