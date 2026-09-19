# HomeHub

HomeHub is a full-stack household dashboard built with React, TypeScript, Express, and PostgreSQL. Its implemented core provides account authentication, one-time administrator setup, household member management, and administrator password recovery.

The project began as a frontend prototype. The account system now uses a real backend and database; AI, cloud storage, shared tasks, and infrastructure dashboards remain prototypes. This repository is under active development and is not yet a verified production release.

## Current implementation

| Area                                       | Status                                                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Sign in, sign out, and session restoration | Connected to Better Auth and PostgreSQL                                                                                                 |
| Initial administrator setup                | Secret-gated setup with input validation, a database transaction, and a locked singleton setup record                                   |
| Household account management               | Administrator UI for creating/listing/removing members, viewing sessions, ending sessions, and setting passwords                        |
| Administrator password recovery            | Email reset links through Nodemailer; recovery checks the account's current administrator role and revokes sessions on successful reset |
| Access control                             | Protected frontend routes and Better Auth's server-side administrator operations; public sign-up disabled                               |
| API safeguards                             | Helmet headers, setup origin/header checks, setup rate limiting, and database-backed authentication rate limiting                       |
| Database                                   | Prisma schema and SQL migrations; separate application and migration roles; PostgreSQL Docker Compose configuration                     |
| Automated checks                           | Frontend/component tests, backend unit tests, and separate database integration tests; current failures are documented below            |

Member recovery is handled by an administrator. Email recovery is restricted to administrators. No pre-created demo accounts are supplied by the current authentication system.

## Prototype features and roadmap

The following screens are still present in this checkout, but their data is simulated:

- Local AI chat and model availability.
- Nextcloud storage summaries and file listings.
- Notion-style tasks and calendar; edits are local UI state and do not write to Notion.
- Host metrics, container health, and Pi-hole statistics.
- Dashboard activity, service health, and storage usage.

External launch links do not establish an API integration. `VITE_DATA_MODE` is a reserved configuration value, not a switch that implements live service adapters. Profile identity is real, but the profile/help copy and appearance control still contain prototype behavior.

The next release milestone is to expose only implemented account features, then add each service integration with its backend, authorization, error handling, and tests. See [the review and release plan](docs/PROJECT_REVIEW.md).

## Architecture

```text
React browser application
  | same-origin /api requests
  v
Express API
  |-- Better Auth: credentials, sessions, administrator operations, recovery
  |-- Setup API: validation, origin checks, rate limiting, transaction
  |-- Health endpoint
  v
Prisma / PostgreSQL

Administrator recovery email -> Nodemailer -> Gmail SMTP
Prototype service screens     -> local mock data
```

Vite proxies `/api` to the local Express server during development. A deployed installation needs its own reverse proxy/static hosting configuration. Frontend builds now write to `client/dist/` (previously root `dist/`); update any external deployment paths accordingly. The Express app does not serve the frontend bundle, and the Compose files currently run only PostgreSQL.

```text
client/
  src/                React pages, components, routing, services, and tests
  public/             Static browser assets
  index.html          Browser entry point
  vite.config.ts      Frontend dev server and test configuration
  package.json        Frontend scripts and dependencies
server/
  src/                Express API, authentication, setup, and middleware
  prisma/             Database schema and versioned migrations
  tests/              Database integration tests
  package.json        Backend scripts and dependencies
database/bootstrap/   Initial PostgreSQL role/schema provisioning
package.json          npm workspaces and root convenience commands
package-lock.json     Shared dependency lockfile
compose.yml           Local PostgreSQL service
```

## Local development

Use Node.js 24.x (required by the server package), npm, and Docker Compose or an equivalent PostgreSQL instance. The current email module requires Gmail SMTP credentials at server startup, even when recovery is not being used.

### 1. Install and configure

From the repository root:

```sh
npm ci
```

Run installation from the repository root: npm installs both workspaces using the single root lockfile. Frontend configuration belongs in `client/`; backend configuration remains in `server/`. Shared formatting and lint configuration remain at the root.

Create the following private files from their examples. Use independent random credentials; the example values must be replaced. `SETUP_SECRET` must be exactly 43 URL-safe characters, matching the setup validator. Generate it locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Generate a separate authentication secret with another invocation.

| Private file    | Example                 | Used by                        |
| --------------- | ----------------------- | ------------------------------ |
| `.env`          | `.env.example`          | Docker Compose                 |
| `client/.env`   | `client/.env.example`   | Public browser configuration   |
| `server/.env`   | `server/.env.example`   | API runtime                    |
| `database/.env` | `database/.env.example` | Prisma migration configuration |

`DATABASE_URL` must use the `homehub_app` role; `MIGRATION_DATABASE_URL` must use `homehub_migrator`. URL-encode passwords when putting them in connection URLs. Use the database name and host port configured in the root `.env`.

All `VITE_` values are visible to browser users. Database credentials, authentication/setup secrets, and SMTP credentials belong only in private server/database configuration.

### 2. Provision PostgreSQL

```sh
docker compose up -d postgres
```

On a fresh database, run `database/bootstrap/001_roles_and_schema.sql` as the PostgreSQL bootstrap administrator. Compose does **not** mount or execute this script automatically. For example, in PowerShell, replace `BOOTSTRAP_USER` and `DATABASE_NAME` with your configured values:

```powershell
Get-Content database/bootstrap/001_roles_and_schema.sql | docker compose exec -T postgres psql -U BOOTSTRAP_USER -d DATABASE_NAME
```

Then open an interactive PostgreSQL session as that bootstrap administrator:

```sh
docker compose exec postgres psql -U BOOTSTRAP_USER -d DATABASE_NAME
```

Use `\password homehub_migrator` and `\password homehub_app` to assign the two role passwords, then `\q` to exit. Match these passwords to the private connection URLs. The bootstrap script creates roles and schema privileges; migrations create tables and grant application access.

```sh
npm run prisma:generate --workspace=server
npm run db:migrate:deploy --workspace=server
```

These steps describe the checked-in provisioning files; a clean database installation still needs end-to-end verification.

### 3. Start both applications

Run each command in a separate terminal at the repository root:

```sh
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`. Visit `/setup` to create the first administrator using the configured `SETUP_SECRET`. Setup is unavailable after completion; remove the secret from the runtime environment and restart the API once initial setup is complete. Sign in and manage household accounts at `/admin/register`.

On Windows, use `npm.cmd` if PowerShell blocks the npm script shim. `dev:server` loads `server/.env`; the separate workspace `dev:watch` script does not explicitly load that file before module evaluation, so use the documented command for initial setup.

Root commands remain available: `npm run build` builds the client, `npm run build:server` builds the API, and `npm run build:all` builds both. `npm test` runs frontend tests; `npm run test:server` runs backend unit tests. `npm run preview` serves the built frontend only and does not provide the development API proxy.

## API surface

| Path                       | Purpose                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `/api/auth/*`              | Better Auth endpoints for sessions, credentials, administrator operations, and recovery |
| `GET /api/setup/status`    | Whether initial setup is available                                                      |
| `POST /api/setup/complete` | Create the initial administrator                                                        |
| `GET /api/health`          | Process health response; does not check database or email readiness                     |

There are no implemented HomeHub API endpoints for AI, storage, Notion, monitoring, or Pi-hole yet.

## Validation

```sh
npm run build
npm run build:server
npm run lint
npm run test:server
npm test
```

Review results on September 16, 2026:

- Frontend and backend builds passed.
- Backend unit tests: 10 passed.
- Frontend tests: 3 passed, 6 failed. Existing tests still depend on mock authentication and synchronous session state.
- Lint completed with 16 warnings.
- Database integration tests and deployed behavior were not verified in this review.

Frontend tests now run from the client workspace and only collect client/src tests. Backend tests remain separate. The older test results above predate frontend cleanup; the outdated authentication and service-card tests still need updating before they can serve as a release gate.

Database integration tests cover setup rollback/concurrency and administrator password recovery. They require an isolated `homehub_test` database on `127.0.0.1:5434`, provisioned roles/migrations, and `server/.env.test` containing `TEST_APP_DATABASE_PASSWORD` and `TEST_MIGRATOR_DATABASE_PASSWORD`. The test Compose file also requires `TEST_POSTGRES_PASSWORD`. These tests modify test accounts and setup state; use a dedicated test database.

Once that isolated database is provisioned, run from `server/`:

```sh
npx prisma migrate deploy --config prisma.test.config.ts
npx vitest run --config vitest.integration.config.ts
```

## Branches and releases

- `Feature`: preserve the broader prototype as a reference for future integrations.
- `working`: integrate and validate the subset intended for the next release.
- `main`: reviewed release commits used by the server checkout.

At review time all three local branches pointed to the same commit. Local `working` tracked lowercase `origin/working`, while the cached remote branch was uppercase `origin/Working`; normalize this before pushing.

Implement each integration on a short-lived branch based on `working`, bring across only the relevant prototype code, and merge it into `working` after validation. Promote a tested release from `working` to `main`. Avoid merging the entire prototype branch to introduce one feature. See [the release plan](docs/PROJECT_REVIEW.md) for the initial cleanup scope and deployment checks.

## Portfolio

This project demonstrates a transition from a React prototype to a database-backed application: authentication integration, transactional setup, administrator workflows, role-separated database access, and tests for failure paths. The service integrations above remain future work.

See [resume wording](docs/RESUME.md) for concise descriptions grounded in the implementation. A public source repository does not require exposing the private household deployment or providing household credentials.
