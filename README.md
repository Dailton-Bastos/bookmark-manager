# Monorepo API + Web

Monorepo with Web and API applications, sharing build, lint, TypeScript, Webpack, and testing configurations.

## Overview

- Workspace manager: pnpm
- Task orchestration: Turbo
- API: NestJS
- Web: Next.js (App Router)
- Code quality: Biome
- Testing: Jest and Vitest via shared configuration package
- Containerized environment: Docker Compose with healthchecks

## Repository Structure

- apps/api: NestJS backend application
- apps/web: Next.js frontend application
- packages/biome-config: shared lint/format/check presets
- packages/typescript-config: shared tsconfig presets for different stacks
- packages/tailwind-config: shared Tailwind/PostCSS configuration
- packages/webpack-config: shared Webpack/SWC configuration
- packages/testing-config: shared testing configuration (Jest and Vitest)

## Prerequisites

- Node.js 18+ (recomendado: 22)
- pnpm 10+
- Docker and Docker Compose (optional, for containerized workflow)

## Local Setup (without Docker)

1. Install dependencies:

```bash
pnpm install
```

2. Start applications in development mode (Turbo):

```bash
pnpm dev
```

3. Build all projects:

```bash
pnpm build
```

## Docker Compose Setup

1. Start the environment:

```bash
pnpm docker:up
```

2. Access the workspace container:

```bash
pnpm docker:exec
```

3. Stop environment and remove volumes:

```bash
pnpm docker:down
```

### Services

- setup: installs dependencies into the shared volume
- workspace: utility container for development
- api: NestJS on port 3001
- web: Next.js on port 3000

### Healthcheck Endpoints

- API: http://localhost:3001/api/health
- Web: http://localhost:3000/api/health

## Monorepo Scripts

- pnpm dev: runs development tasks
- pnpm build: builds all packages/apps
- pnpm lint: runs lint across the monorepo
- pnpm format: formats code across the monorepo
- pnpm check: runs general checks (Biome)
- pnpm check-types: runs typecheck across all projects
- pnpm lint:fix: applies automatic lint fixes
- pnpm format:fix: applies automatic formatting fixes
- pnpm check:fix: applies automatic check fixes

## Testing

The monorepo supports Jest and Vitest with centralized configurations in packages/testing-config.

### API (apps/api)

- pnpm --filter api test: Jest (unit)
- pnpm --filter api test:watch: Jest watch
- pnpm --filter api test:cov: coverage with Jest
- pnpm --filter api test:e2e: e2e tests with Jest
- pnpm --filter api test:vitest: Vitest
- pnpm --filter api test:vitest:watch: Vitest watch

### Web (apps/web)

- pnpm --filter web test: Vitest
- pnpm --filter web test:watch: Vitest watch

## Turbo Tasks

The main tasks are defined in turbo.json, including:

- build, dev
- lint, format, check
- lint:fix, format:fix, check:fix
- check-types
- test, test:watch, test:cov, test:e2e
- test:vitest, test:vitest:watch

## Shared Packages

### @repo/testing-config

Centralizes presets for:

- Jest base/API/UI
- Vitest base/API/UI

Goal: allow apps to choose their runner (Jest or Vitest) while keeping transformation and behavior standardized.

### @repo/typescript-config

TypeScript presets for multiple contexts:

- base
- nestjs
- nextjs
- react-library

### @repo/biome-config

Base preset for lint/format/check with Biome.

### @repo/webpack-config

Shared Webpack configuration using SWC for API/NestJS scenarios.

## Conventions

- Shared dependency versions via catalog in pnpm-workspace.yaml
- Pipeline orchestration and caching via Turbo
- Commit hooks with Husky + lint-staged + commitlint
- Healthchecks in Dockerfile (production) and docker-compose (development)

## Notes

- The READMEs in apps/api and apps/web still reflect the default framework templates.
- This README describes the consolidated monorepo state at the project root.
