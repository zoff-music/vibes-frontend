# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/platform/package.json apps/platform/package.json
COPY apps/cast/package.json apps/cast/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages ./packages

RUN --mount=type=cache,id=vibes-frontend-pnpm-store,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store \
	&& pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/platform ./apps/platform

RUN pnpm --filter @vibez/platform build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/platform/package.json ./apps/platform/package.json
COPY --from=builder /src/apps/platform/node_modules ./apps/platform/node_modules
COPY --from=builder /src/apps/platform/dist ./apps/platform/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000

WORKDIR /app/apps/platform

CMD ["./node_modules/.bin/react-router-serve", "./dist/server/index.js"]
