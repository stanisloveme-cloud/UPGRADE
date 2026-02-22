# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install production deps as root, then switch to non-root user
RUN npm ci --omit=dev && npx prisma generate
COPY --from=builder /app/dist ./dist
# Create uploads dir with correct ownership before switching user
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
# Switch to non-root for runtime security
USER node

EXPOSE 3000
CMD ["node", "dist/src/main"]
