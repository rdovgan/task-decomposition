# Environment Management Guide

This guide explains how to switch between different environments (development, staging, production) in the Task Decomposition Tool.

## Overview

The project supports four environments:
- **Development** - Local development environment
- **Staging** - Pre-production testing environment
- **Production** - Live production environment
- **Test** - Automated testing environment

Each environment has its own:
- Database
- Configuration
- API keys
- Feature flags

## Environment Files

Each environment has its own configuration file:
- `.env.development` - Development environment (default)
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.test` - Test environment

The `.env` file is a symlink/copy of the active environment's configuration.

## Switching Environments

### Quick Switch

Use the convenience npm scripts:

```bash
# Switch to development
npm run env:dev

# Switch to staging
npm run env:staging

# Switch to production
npm run env:prod

# Switch to test
npm run env:test

# Check current environment
npm run env:current
```

### Manual Switch

Or use the switch-env script directly:

```bash
./scripts/switch-env.sh [development|staging|production|test]
```

Example:
```bash
./scripts/switch-env.sh staging
```

The script will:
1. Backup your current `.env` file to `.env.backup`
2. Copy the selected environment file to `.env`
3. Display the current configuration
4. Show next steps

## Environment-Specific Operations

### Development Environment

```bash
# Switch to development
npm run env:dev

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start services
npm run dev:all
```

**Database:** `task_decomposition_dev` on localhost:5432

### Staging Environment

```bash
# Switch to staging
npm run env:staging

# Setup database (be careful!)
npm run db:generate
npm run db:push
npm run db:seed

# Start with Docker Compose
docker-compose -f docker-compose.staging.yml up -d

# Or start locally
npm run dev:all
```

**Database:** `task_decomposition_staging` on localhost:5433 (via Docker)

### Production Environment

⚠️ **Warning:** Be extremely careful when working with production!

```bash
# Switch to production
npm run env:prod

# Review configuration
cat .env

# Update secrets if needed
# Edit .env and update:
# - ANTHROPIC_API_KEY
# - JWT_SECRET
# - DATABASE_URL

# Setup database (ONLY if needed)
npm run db:generate
npm run db:push  # ⚠️ Destructive in production!

# Start with Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

**Database:** `task_decomposition_prod` on localhost:5434 (via Docker)

### Test Environment

```bash
# Switch to test
npm run env:test

# Setup test database
npm run db:generate
npm run db:push

# Run tests
npm run test
npm run test:e2e
```

**Database:** `task_decomposition_test` on localhost:5432

## Docker Compose Environments

### Development (default)
```bash
docker-compose up -d
```

### Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
docker-compose -f docker-compose.production.yml up -d
```

## Database Ports

To avoid conflicts, each Docker environment uses different ports:

| Environment | PostgreSQL | Redis |
|------------|-----------|-------|
| Development | 5432 | 6379 |
| Staging | 5433 | 6380 |
| Production | 5434 | 6381 |

## Environment Variables

Each environment file contains:

### Required Variables
- `NODE_ENV` - Environment name (development/staging/production/test)
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API server port (default: 3001)
- `NEXT_PUBLIC_API_URL` - Frontend API URL

### Optional Variables
- `ANTHROPIC_API_KEY` - Claude AI API key for task decomposition
- `ANTHROPIC_MODEL` - Claude model to use (default: claude-sonnet-4-6)
- `JWT_SECRET` - Secret for JWT tokens
- `ALLOWED_ORIGINS` - CORS allowed origins

### Feature Flags
- `ENABLE_AI_DECOMPOSITION` - Enable AI-powered task decomposition
- `ENABLE_TASK_GRAPH` - Enable task dependency graph visualization
- `ENABLE_COMMENTS` - Enable task comments

## Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment-specific files** (`.env.development`, etc.) for version control
3. **Backup before switching** - The script automatically creates `.env.backup`
4. **Test in staging first** - Always test changes in staging before production
5. **Review configuration** - Check `.env` after switching to ensure correct values
6. **Keep secrets secure** - Use different API keys for each environment
7. **Database backups** - Always backup production databases before migrations

## Troubleshooting

### Database Connection Issues

If you can't connect to the database after switching:

1. Check the environment is correct:
   ```bash
   npm run env:current
   ```

2. Verify the database exists:
   ```bash
   # PostgreSQL
   psql -U taskdecomp -h localhost -p 5432 -l
   ```

3. Regenerate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Push schema changes:
   ```bash
   npm run db:push
   ```

### Port Conflicts

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill the process if needed
kill -9 <PID>
```

### Wrong Environment

If you accidentally switched to the wrong environment:

```bash
# Restore from backup
cp .env.backup .env

# Or switch to the correct environment
npm run env:dev
```

## CI/CD Integration

For CI/CD pipelines, set the environment programmatically:

```bash
# Example GitHub Actions
- name: Switch to production environment
  run: npm run env:prod

- name: Deploy to production
  run: |
    docker-compose -f docker-compose.production.yml up -d
```

## Monitoring

Check which environment you're running:

```bash
# Check Node environment
echo $NODE_ENV

# Check database connection
grep DATABASE_URL .env

# Check API URL
grep NEXT_PUBLIC_API_URL .env
```

## Security Checklist

- [ ] Different API keys for each environment
- [ ] Strong JWT_SECRET in production
- [ ] Database passwords are unique
- [ ] CORS allows only appropriate origins
- [ ] `.env` files are in `.gitignore`
- [ ] Secrets are stored in secret management systems (Vault, AWS Secrets Manager, etc.)
- [ ] Access logs are monitored
- [ ] Database backups are automated
