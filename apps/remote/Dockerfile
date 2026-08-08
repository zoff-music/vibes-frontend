ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/remote/package.json apps/remote/package.json
COPY apps/platform/package.json apps/platform/package.json
COPY apps/cast/package.json apps/cast/package.json
COPY apps/embed/package.json apps/embed/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/remote ./apps/remote

RUN pnpm --filter @vibes/remote build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/remote/package.json ./apps/remote/package.json
COPY --from=builder /src/apps/remote/server ./apps/remote/server
COPY --from=builder /src/apps/remote/node_modules ./apps/remote/node_modules
COPY --from=builder /src/apps/remote/dist ./apps/remote/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3008

WORKDIR /app/apps/remote

CMD ["node", "server/index.ts"]
