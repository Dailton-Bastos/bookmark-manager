# syntax=docker/dockerfile:1.18-labs
ARG NODE_TAG=22-alpine
ARG PNPM_VERSION=10.30.3

# -------- Production Builder --------
FROM node:${NODE_TAG} AS builder
ARG PNPM_VERSION

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

# Copy manifests
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY --parents packages/*/package.json ./

# Install workspace deps
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store \
	&& pnpm install --frozen-lockfile

# Copy in only what the API needs
COPY apps/api apps/api
COPY packages packages

# Build the api (outputs to apps/api/dist)
RUN pnpm turbo build --filter=api

# Prune to runtime-only (dist + prod deps)
RUN pnpm -F api deploy --prod /out

# -------- Production --------
FROM node:${NODE_TAG} AS prod

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /out ./

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "const http=require('node:http');const req=http.get('http://127.0.0.1:3001/api/health',(res)=>{process.exit(res.statusCode>=200&&res.statusCode<500?0:1)});req.on('error',()=>process.exit(1));req.setTimeout(4000,()=>{req.destroy();process.exit(1)});"

CMD ["node", "dist/main"]

# -------- Dev (with hot reload) --------
FROM node:${NODE_TAG} AS dev
ARG PNPM_VERSION

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

CMD ["pnpm", "turbo", "dev", "--filter=api"]
