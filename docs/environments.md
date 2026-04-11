# Environment Management Quick Start

## Switch Environments

```bash
# Development (default)
npm run env:dev

# Staging
npm run env:staging

# Production
npm run env:prod

# Test
npm run env:test

# Check current
npm run env:current
```

## Quick Reference

| Environment | Database | Port | Purpose |
|------------|----------|------|---------|
| Development | `task_decomposition_dev` | 3000/3001 | Local development |
| Staging | `task_decomposition_staging` | 3000/3001 | Pre-production testing |
| Production | `task_decomposition_prod` | 3000/3001 | Live production |
| Test | `task_decomposition_test` | 3000/3001 | Automated testing |

## Docker Commands

```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.production.yml up -d
```

## Database Setup

```bash
# After switching environments
npm run db:generate
npm run db:push
npm run db:seed
```

## See Also

- [Full Environment Management Guide](./environment-management.md)
- [README](../README.md)
