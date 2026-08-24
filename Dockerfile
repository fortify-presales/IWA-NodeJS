# Multi-stage Dockerfile for IWA Pharmacy Direct
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime

RUN groupadd -r iwa && useradd -r -g iwa iwa

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.example ./.env.example
COPY docker-entrypoint.sh ./

RUN mkdir -p data logs data/uploads && chown -R iwa:iwa /app
USER iwa

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:8080/api/v3/site/status',r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["./docker-entrypoint.sh"]
