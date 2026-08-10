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
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
# Pass via compose build args so the same image is configurable per env.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
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

# Copy the full runtime dependency tree (express, cors, pg + transitive deps,
# @prisma/client + adapter-pg, openai, zod, multer, ...). Copying individual
# packages breaks because transitive deps (pg-types, pg-protocol, ...) are missed.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
RUN npx prisma generate && \
    # Let the non-root runtime user regenerate the client from the entrypoint
    chown -R appuser:nodejs node_modules/.prisma node_modules/@prisma

COPY --from=builder --chown=appuser:nodejs /app/dist/server ./dist/server

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser
EXPOSE 3001
ENV PORT=3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server/index.js"]
