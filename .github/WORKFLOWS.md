# GitHub Actions Workflows

This repository includes several automated workflows to ensure code quality, security, and streamline the development process.

## Workflows

### 1. CI Workflow (`ci.yml`)
**Triggers:** Push to main, Pull requests to main

**Purpose:** Continuous Integration - validates code changes

**Steps:**
- Checks out code
- Sets up Node.js 20.x with npm caching
- Installs dependencies
- Runs type checking (`npm run types:check`)
- Builds the project (`npm run build`)

### 2. Deploy Workflow (`deploy.yml`)
**Triggers:** Push to main branch

**Purpose:** Prepares deployments for production

**Steps:**
- Checks out code
- Sets up Node.js 20.x with npm caching
- Installs dependencies
- Builds the project
- Provides deployment notification

**Note:** This workflow can be extended with actual deployment steps for platforms like Vercel or Netlify.

### 3. Dependency Review Workflow (`dependency-review.yml`)
**Triggers:** Pull requests to main

**Purpose:** Security review of dependency changes

**Features:**
- Reviews dependencies added or updated in pull requests
- Fails if dependencies have moderate or higher severity vulnerabilities
- Helps prevent introducing vulnerable dependencies

### 4. Dependabot Configuration (`dependabot.yml`)
**Purpose:** Automated dependency updates

**Features:**
- **npm packages:** Checked weekly
  - Groups minor and patch updates together
  - Limits to 10 open PRs
- **GitHub Actions:** Checked monthly
  - Limits to 5 open PRs

## Security

All workflows follow security best practices:
- Explicit permissions (least privilege principle)
- Use pinned versions of GitHub Actions
- Dependency scanning enabled

## Benefits

1. **Automated Testing:** Every push and PR is automatically tested
2. **Type Safety:** TypeScript type checking catches errors early
3. **Security:** Automated dependency vulnerability scanning
4. **Up-to-date Dependencies:** Dependabot keeps dependencies current
5. **Consistent Builds:** Same build process across all environments
