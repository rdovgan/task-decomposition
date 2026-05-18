# Multi-stage Dockerfile for Task Decomposition Tool
# Supports both Next.js frontend and Express server

# ─── Base ───────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig \
    pixman-dev cairo-dev pango-dev giflib-dev libjpeg-turbo-dev
WORKDIR /app

# ─── Dependencies ───────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* testing-library-react-*.tgz ./
RUN npm ci

# ─── Development (used for both app & server) ───────────────────────
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 3000 3001

# Default: run Next.js dev server (override in docker-compose for the backend)
CMD ["npm", "run", "dev"]

# ─── Builder (production) ──────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm run build:server

# ─── Production: Frontend ──────────────────────────────────────────
FROM base AS frontend
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./package.json
RUN npx prisma generate

COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown -R nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

# ─── Production: Backend API ───────────────────────────────────────
FROM base AS backend
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/pg ./node_modules/pg
COPY --from=builder /app/node_modules/@prisma/adapter-pg ./node_modules/@prisma/adapter-pg
COPY --from=builder /app/package.json ./package.json
RUN npx prisma generate

COPY --from=builder --chown=appuser:nodejs /app/dist/server ./dist/server

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser
EXPOSE 3001
ENV PORT=3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server/index.js"]
