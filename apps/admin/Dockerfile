ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY apps/platform/package.json apps/platform/package.json
COPY apps/cast/package.json apps/cast/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/admin ./apps/admin

RUN pnpm --filter @vibes/admin build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/admin/package.json ./apps/admin/package.json
COPY --from=builder /src/apps/admin/server ./apps/admin/server
COPY --from=builder /src/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=builder /src/apps/admin/dist ./apps/admin/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3006

WORKDIR /app/apps/admin

CMD ["node", "server/index.ts"]
