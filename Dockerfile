# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app
# Add non-root user
USER node
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
RUN npm ci --omit=dev
COPY --chown=node:node --from=builder /app/dist ./dist
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/src/main"]
