# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:24-alpine AS builder
WORKDIR /app

# Husky tidak dibutuhkan di dalam image
ENV HUSKY=0

# Nilai public di-inline saat build (ADR-0009): satu image per brand
ARG PUBLIC_BRAND=neutral
ARG PUBLIC_APP_NAME=Dashboard
ENV PUBLIC_BRAND=$PUBLIC_BRAND \
    PUBLIC_APP_NAME=$PUBLIC_APP_NAME

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build \
 && npm prune --omit=dev

# ---------- Runtime stage ----------
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# tini: meneruskan sinyal (SIGTERM) ke Node agar shutdown rapi
RUN apk add --no-cache tini \
 && addgroup -S app \
 && adduser -S app -G app

COPY --from=builder --chown=app:app /app/package.json ./
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist

USER app
EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./dist/server/entry.mjs"]
