# Use Bun base image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim as production
WORKDIR /app

# Copy built application
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/frontend/dist ./frontend/dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start the application
CMD ["bun", "run", "backend/dist/index.js"]