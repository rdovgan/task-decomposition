#!/bin/sh
set -e

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

echo "✅ Database ready!"

# Execute the main command
exec "$@"
