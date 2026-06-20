# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY services/api/package.json ./services/api/
COPY packages/db/package.json ./packages/db/
COPY packages/validation/package.json ./packages/validation/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @athoo/api...

# Copy source
COPY services/api/ ./services/api/
COPY packages/db/ ./packages/db/
COPY packages/validation/ ./packages/validation/
COPY packages/config/ ./packages/config/
COPY packages/utils/ ./packages/utils/

# Build
RUN pnpm --filter @athoo/api run build

# ── Stage 2: Production ────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 athoo

COPY --from=builder --chown=athoo:nodejs /app/services/api/dist ./dist
COPY --from=builder --chown=athoo:nodejs /app/services/api/package.json .

USER athoo

EXPOSE 8080
ENV PORT=8080 NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
