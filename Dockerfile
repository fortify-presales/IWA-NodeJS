# Multi-stage Dockerfile for IWA Pharmacy Direct (npm workspaces monorepo)
FROM node:20 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/agent/package.json packages/agent/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json
RUN npm ci
COPY . .
# Reinstall after copying source to ensure workspace symlinks are set up
RUN npm install --package-lock=false
RUN npm run build

FROM node:20-slim AS runtime

# Install build tools temporarily to recompile native modules (libxmljs2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential g++ make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/agent/package.json packages/agent/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json

# Copy precompiled node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Recompile native modules in the target environment
RUN npm rebuild

# Remove build tools after compilation
RUN apt-get remove -y python3 build-essential g++ make \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r iwa && useradd -r -g iwa iwa

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/agent/dist ./packages/agent/dist
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/public ./public
COPY --from=builder /app/.env.example ./.env.example
COPY docker-entrypoint.sh ./

ENV NODE_ENV=production
ENV PORT=8080

RUN chmod +x docker-entrypoint.sh && mkdir -p data logs data/uploads && chown -R iwa:iwa /app
USER iwa

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:8080/api/v3/site/status',r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["./docker-entrypoint.sh"]
