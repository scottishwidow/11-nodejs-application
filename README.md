# NestJS CI Sample

A minimal NestJS backend and unit test suite intended for continuous integration demos.

## Requirements

- Node.js 18+ (or 20+)
- pnpm

## Environment

The app requires `APP_VERSION` to be set and non-empty.

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

## Notes for CI

- `pnpm test` will fail if `APP_VERSION` is missing or empty.
- Typical pipeline order: install -> test -> build.