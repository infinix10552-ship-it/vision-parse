# --- FRONTEND BUILD STAGE ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and local workspace (frontend)
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Build frontend assets
RUN npm run build:prod

# --- FINAL PRODUCTION STAGE ---
FROM node:22-alpine

WORKDIR /app

# Add a non-root user for security
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

# Set environment to production
ENV NODE_ENV=production

# Copy built backend + static public folder from the builder stage
# We only need the backend folder and the public assets
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend ./backend/

# Install ONLY production dependencies for the backend
WORKDIR /app/backend
RUN npm ci --only=production

# Final cleanup
RUN rm -rf src/config/.env

# Switch to non-root user
USER nodeapp

# Expose the API and Frontend combined port
EXPOSE 3001

# Start the unified server
CMD ["node", "server.js"]
