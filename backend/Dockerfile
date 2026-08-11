# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# ---- Full deps (build/dev tooling incl. cross-env) ----
FROM base AS build-deps
COPY package*.json ./
RUN npm ci

# ---- Runtime ----
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY .env.example ./.env.example

EXPOSE 5000
CMD ["node", "src/index.js"]