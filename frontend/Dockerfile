# ==========================================
# Stage 1: Build React SPA with Vite
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source and build static distribution
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with lightweight Nginx
# ==========================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default static assets
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration with API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O - http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
