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

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss
npx prisma generate

echo "✅ Database ready!"

# Execute the main command
exec "$@"
