# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# Install production deps as root, then switch to non-root user
RUN npm install --omit=dev && npx prisma generate
COPY --from=builder /app/dist ./dist
COPY scripts/scraped_brands.json ./scripts/
COPY scripts/scraped_speakers.json ./scripts/
COPY uploads/legacy_brands ./uploads/legacy_brands
# Create uploads dir with correct ownership before switching user
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
# Switch to non-root for runtime security
USER node

EXPOSE 3000
CMD ["node", "dist/src/main"]
