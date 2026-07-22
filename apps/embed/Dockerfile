ARG NODE_VERSION=26
ARG PNPM_VERSION=11.5.2

FROM node:${NODE_VERSION}-bookworm-slim AS deps

WORKDIR /src

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml biome.json tsconfig.json ./
COPY apps/embed/package.json apps/embed/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps/embed ./apps/embed

RUN pnpm --filter @vibes/embed build

FROM node:${NODE_VERSION}-bookworm-slim AS prod

WORKDIR /app

COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/packages ./packages
COPY --from=builder /src/apps/embed/package.json ./apps/embed/package.json
COPY --from=builder /src/apps/embed/server ./apps/embed/server
COPY --from=builder /src/apps/embed/node_modules ./apps/embed/node_modules
COPY --from=builder /src/apps/embed/dist ./apps/embed/dist

ENV NODE_ENV=production
ENV VITE_API_URL_INTERNAL=http://vibes-backend.vibes.svc.cluster.local

EXPOSE 3000
EXPOSE 3002

WORKDIR /app/apps/embed

CMD ["node", "server/index.ts"]
