# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars required by Next.js server-side code
ARG COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
ARG NEXT_PUBLIC_COINGECKO_API_KEY
ARG EXCHANGE=bybit

ENV COINGECKO_BASE_URL=$COINGECKO_BASE_URL \
    NEXT_PUBLIC_COINGECKO_API_KEY=$NEXT_PUBLIC_COINGECKO_API_KEY \
    EXCHANGE=$EXCHANGE

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as non-root for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only the standalone output — much smaller than full node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000

# next/standalone produces server.js at the root
CMD ["node", "server.js"]