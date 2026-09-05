ARG NODE_VERSION=26.8.1
ARG PNPM_VERSION=12.3.4

FROM node:${NODE_VERSION}-bookworm-slim AS deps

ARG PNPM_VERSION

WORKDIR /src

RUN apt-get update \
    && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@${PNPM_VERSION} \
    && test "$(pnpm --version)" = "${PNPM_VERSION}"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY patches ./patches
COPY apps/cast/package.json apps/cast/package.json
COPY apps/platform/package.json apps/platform/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/cast ./apps/cast

RUN pnpm --filter @vibes/cast build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/cast/package.json ./apps/cast/package.json
COPY --from=builder /src/apps/cast/server ./apps/cast/server
COPY --from=builder /src/apps/cast/node_modules ./apps/cast/node_modules
COPY --from=builder /src/apps/cast/dist ./apps/cast/dist

ENV NODE_ENV=production

EXPOSE 3001
EXPOSE 3004

WORKDIR /app/apps/cast

CMD ["node", "server/index.ts"]
