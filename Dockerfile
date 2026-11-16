# Stage 1: Build the frontend web application
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN npm install
RUN npm run build

# Stage 2: Unified Production Container (FastAPI + Nginx)
FROM python:3.11-slim AS runner

WORKDIR /app

# Install Nginx and curl
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY services/transcript-api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI backend microservice code
COPY services/transcript-api/app ./app

# Copy built frontend into Nginx HTML directory
COPY --from=frontend-builder /app/apps/demo/dist /usr/share/nginx/html

# Copy Nginx reverse-proxy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy container entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Expose HTTP port
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD curl -sf http://127.0.0.1:80/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
