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
COPY apps/embed/package.json apps/embed/package.json
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

COPY apps/embed ./apps/embed

RUN pnpm --filter @vibes/embed build

FROM base AS production-deps

RUN pnpm --filter @vibes/embed... install --prod --frozen-lockfile

FROM ${NODE_RUNTIME_IMAGE} AS prod

WORKDIR /app

COPY --from=production-deps /src/package.json ./package.json
COPY --from=production-deps /src/node_modules ./node_modules
COPY packages ./packages
COPY --from=production-deps /src/packages ./packages
COPY --from=production-deps /src/apps/embed/package.json ./apps/embed/package.json
COPY --from=production-deps /src/apps/embed/node_modules ./apps/embed/node_modules
COPY --from=builder /src/apps/embed/server ./apps/embed/server
COPY --from=builder /src/apps/embed/dist ./apps/embed/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3002

WORKDIR /app/apps/embed

CMD ["node", "server/index.ts"]
