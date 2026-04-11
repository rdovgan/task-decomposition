# Scripts Directory

This directory contains utility scripts for the Task Decomposition Tool.

## Available Scripts

### switch-env.sh

**Purpose:** Switch between different environments (development, staging, production, test)

**Usage:**
```bash
./scripts/switch-env.sh [development|staging|production|test]
```

**What it does:**
1. Backs up current `.env` to `.env.backup`
2. Copies the selected environment configuration to `.env`
3. Displays current environment info
4. Shows next steps

**Examples:**
```bash
# Switch to development
./scripts/switch-env.sh development

# Switch to staging
./scripts/switch-env.sh staging

# Switch to production
./scripts/switch-env.sh production

# Switch to test
./scripts/switch-env.sh test
```

**Environment files:**
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.test` - Test environment

**NPM shortcuts:**
```bash
npm run env:dev
npm run env:staging
npm run env:prod
npm run env:test
npm run env:current
```

## Adding New Scripts

When adding new scripts:
1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add documentation here
3. Consider adding npm shortcuts in `package.json`

## Best Practices

1. **Always make scripts executable:** `chmod +x scripts/script-name.sh`
2. **Use set -e** to exit on errors
3. **Provide clear error messages** with colors/icons
4. **Validate input** before making changes
5. **Create backups** before destructive operations
6. **Document usage** in this README
