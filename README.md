# NestJS CI Sample

A minimal NestJS backend and unit test suite intended for future demos.

## Requirements

- Node.js 18+ (or 20+)
- pnpm

## Environment

The app requires `APP_VERSION` to be set and non-empty.
The app also requires a PostgreSQL connection and schema (see below).

Example:

```bash
export APP_VERSION="1.0.0"
```

## Scripts

- `pnpm install`
- `pnpm test`
- `pnpm build`
- `pnpm start`
- `pnpm clean`

## Endpoints

- `GET /` returns `{ "message": "<APP_VERSION>" }`.
- `GET /health` returns a simple health payload.
- `GET /messages?limit=50` returns the newest messages (stateful, stored in Postgres).
- `POST /messages` with `{ "body": "..." }` creates a message.

## Database

The application uses PostgreSQL via the `pg` driver. Provide either a
`DATABASE_URL` or the standard `PG*` variables (`PGHOST`, `PGPORT`, `PGUSER`,
`PGPASSWORD`, `PGDATABASE`).

### Init SQL (use for Docker Compose init container)

```sql
create table if not exists app_messages (
  id bigserial primary key,
  body text not null,
  created_at timestamptz not null default now()
);
```