# Multi-stage builder for zero-bloat production image
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN npm install
RUN npm run build

# Nginx static server with gzip & VTT support
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/apps/demo/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
