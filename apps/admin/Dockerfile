ARG NODE_VERSION=26.12.1
ARG NODE_RUNTIME_IMAGE=platformatic/node-caged:26-slim
ARG PNPM_VERSION=12.3.4

FROM node:${NODE_VERSION}-bookworm-slim AS base

ARG PNPM_VERSION

WORKDIR /src

RUN apt-get update \
    && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@${PNPM_VERSION} \
    && test "$(pnpm --version)" = "${PNPM_VERSION}"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY patches ./patches
COPY apps/admin/package.json apps/admin/package.json
COPY apps/platform/package.json apps/platform/package.json
COPY apps/cast/package.json apps/cast/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/models/package.json packages/models/package.json
COPY packages/serve/package.json packages/serve/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/tailwind/package.json packages/tailwind/package.json
COPY packages/ui/package.json packages/ui/package.json

FROM base AS deps

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY packages ./packages

ARG ASSET_ORIGIN=""
ENV ASSET_ORIGIN=${ASSET_ORIGIN}

COPY apps/admin ./apps/admin

RUN pnpm --filter @vibes/admin build

FROM base AS production-deps

RUN pnpm --filter @vibes/admin... install --prod --frozen-lockfile

FROM ${NODE_RUNTIME_IMAGE} AS prod

WORKDIR /app

COPY --from=production-deps /src/package.json ./package.json
COPY --from=production-deps /src/node_modules ./node_modules
COPY packages ./packages
COPY --from=production-deps /src/packages ./packages
COPY --from=production-deps /src/apps/admin/package.json ./apps/admin/package.json
COPY --from=production-deps /src/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=builder /src/apps/admin/server ./apps/admin/server
COPY --from=builder /src/apps/admin/dist ./apps/admin/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3006

WORKDIR /app/apps/admin

CMD ["node", "server/index.ts"]
