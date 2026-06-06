# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/cast/package.json apps/cast/package.json
COPY apps/platform/package.json apps/platform/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages ./packages

RUN --mount=type=cache,id=vibes-frontend-pnpm-store,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store \
	&& pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/cast ./apps/cast

RUN pnpm --filter @vibez/cast build

FROM nginx:1.29-alpine AS prod

COPY apps/cast/.build/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/apps/cast/dist /usr/share/nginx/html/casting/receiver

EXPOSE 3001
