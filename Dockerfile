FROM node:20-alpine

WORKDIR /app

# 1. Install Root Dependencies
COPY package*.json ./
RUN npm ci

# 2. Install Client Dependencies
COPY client/package*.json client/
RUN cd client && npm ci

# 3. Copy Source Code
COPY . .

# 4. Build Client
RUN cd client && npm run build

# 5. Build Server
RUN npx prisma generate
RUN npm run build
RUN ls -R dist || echo "dist not found"

EXPOSE 3000

CMD ["node", "dist/main"]
