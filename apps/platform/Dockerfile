ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/platform/package.json apps/platform/package.json
COPY apps/cast/package.json apps/cast/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/platform ./apps/platform

RUN pnpm --filter @vibes/platform build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/platform/package.json ./apps/platform/package.json
COPY --from=builder /src/apps/platform/server ./apps/platform/server
COPY --from=builder /src/apps/platform/node_modules ./apps/platform/node_modules
COPY --from=builder /src/apps/platform/dist ./apps/platform/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3002

WORKDIR /app/apps/platform

CMD ["node", "server/index.ts"]
