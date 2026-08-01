#!/bin/sh
set -e

if [ "$NODE_ENV" = "development" ]; then
  echo "📦 Syncing node_modules with package.json..."
  # The dev containers bind-mount source code but keep node_modules in a
  # named volume (so host/container native builds don't clash). That volume
  # persists across image rebuilds, so a plain rebuild silently keeps stale
  # deps — `npm install` here is a fast no-op when nothing changed, and
  # picks up new/updated packages otherwise. Production/staging images bake
  # node_modules in at build time (no volume), so this only runs in dev.
  npm install --no-audit --no-fund
fi

echo "⏳ Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL
until node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect()
  .then(() => { console.log('✅ PostgreSQL is ready'); c.end(); process.exit(0); })
  .catch(() => { process.exit(1); });
" 2>/dev/null; do
  echo "   PostgreSQL not ready yet, retrying in 2s..."
  sleep 2
done

echo "🔄 Syncing database schema..."
# This project has no versioned migrations under prisma/migrations, so
# `prisma migrate deploy` is a no-op that exits 0 (nothing "fails"), which
# means a `|| prisma db push` fallback never actually runs. Push directly
# when there are no real migrations to deploy; use migrate deploy once some
# exist.
if [ -d "prisma/migrations" ] && [ -n "$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --accept-data-loss
fi
npx prisma generate

echo "🌱 Ensuring placeholder demo user exists..."
# There's no real auth yet, so the frontend hardcodes "demo-user-id"
# everywhere (Settings page, task dialogs, etc.). UserSettings (API keys,
# Jira connection) has a required FK to a User row, so this must exist on
# every environment, not just ones where someone remembered to run the seed.
node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
prisma.user.upsert({
  where: { id: 'demo-user-id' },
  update: {},
  create: { id: 'demo-user-id', email: 'demo@example.com', name: 'Demo User', role: 'ADMIN' },
}).then(() => prisma.\$disconnect());
"

echo "✅ Database ready!"

# Execute the main command
exec "$@"
