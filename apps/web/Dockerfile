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
COPY apps/web/package.json apps/web/
COPY --parents packages/*/package.json ./

# Install workspace deps
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store \
	&& pnpm install --frozen-lockfile

# Copy in only what the App Web needs
COPY apps/web apps/web
COPY packages packages

# Build the web (outputs to apps/web/dist)
RUN pnpm turbo build --filter=web

# -------- Production --------
FROM node:${NODE_TAG} AS prod

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Copy production assets
COPY --from=builder --chown=node:node /usr/src/app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=node:node /usr/src/app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /usr/src/app/apps/web/.next/static ./apps/web/.next/static

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "const http=require('node:http');const bindHost=process.env.HOSTNAME||process.env.HOST||'0.0.0.0';const host=bindHost==='0.0.0.0'?'127.0.0.1':bindHost==='::'?'::1':bindHost;const port=Number(process.env.PORT||3000);const req=http.get({host,port,path:'/api/health'},(res)=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.setTimeout(4000,()=>{req.destroy();process.exit(1)});"

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

CMD ["node", "apps/web/server.js"]

# -------- Development (with hot reload) --------
FROM node:${NODE_TAG} AS dev
ARG PNPM_VERSION

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV TURBO_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

WORKDIR /usr/src/app

CMD ["pnpm", "turbo", "dev", "--filter=web"]
