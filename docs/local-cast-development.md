# Local Cast development

Run the Cast receiver with a local platform, API, PostgreSQL database, and
Redis instance so sender and receiver changes can be verified without a
deployment.

The commands below assume the repositories are siblings under the same
development directory:

- `vibes-frontend`
- `vibes`
- `vibes-migrator`

## 1. Start PostgreSQL and Redis

```bash
docker run --rm \
  --name zoff-local-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vibes \
  -p 127.0.0.1:5432:5432 \
  postgres:18
```

```bash
docker run --rm \
  --name zoff-local-redis \
  -p 127.0.0.1:6379:6379 \
  redis:8-alpine
```

## 2. Apply the database migrations

From `vibes-migrator` on fresh `main`:

```bash
DATABASE_URL='postgres://postgres:password@localhost:5432/vibes?sslmode=disable' \
  GOFLAGS=-mod=mod \
  go run cmd/migrator/main.go up
```

## 3. Start the API

From `vibes` on fresh `main`, replace the provider key placeholders with local
development credentials:

```bash
PORT=8080 \
INTERNAL_PORT=8081 \
DATABASE_URL='postgres://postgres:password@localhost:5432/vibes?sslmode=disable' \
REDIS_URL='redis://localhost:6379/0' \
RATE_LIMIT_ENABLED=false \
COOKIE_SECRET='local-cookie-secret' \
CAST_TOKEN_SECRET='local-cast-token-secret' \
YOUTUBE_API_KEY='your-development-key' \
GROK_API_KEY='your-development-key' \
CORS_ALLOWED_ORIGINS='http://localhost:3001,http://localhost:3003' \
OTEL_SAMPLER_PARAM=0 \
GOFLAGS=-mod=mod \
go run cmd/server/main.go
```

Run `make docs` first if the generated `swaggerdocs` package is absent.

## 4. Start the receiver and platform

From `vibes-frontend`, start the receiver:

```bash
pnpm --filter @vibes/cast dev
```

In a second terminal, start the platform with the receiver's absolute local
URL:

```bash
CAST_RECEIVER_URL='http://localhost:3003/casting/receiver/' \
VITE_API_URL='http://localhost:8080' \
VITE_API_URL_INTERNAL='http://localhost:8080' \
pnpm --filter @vibes/platform dev
```

Start a separate Chrome profile with the Cast receiver's autoplay behavior:

```bash
open -na 'Google Chrome' --args \
  --user-data-dir=/tmp/zoff-local-cast-chrome \
  --autoplay-policy=no-user-gesture-required \
  http://localhost:3001
```

Create or join a room, add a YouTube song, and select **Local Cast (Emulator)**
from the Cast menu. An ordinary desktop browser blocks audible autoplay without
interaction and therefore does not model a Cast receiver accurately. The
receiver never renders an unusable click-to-play prompt.

## 5. Shut the stack down

Stop the API and frontend processes, then stop the exact local containers:

```bash
docker stop zoff-local-postgres zoff-local-redis
```
