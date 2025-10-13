# Use Debian-based image to support prebuilt better-sqlite3 binaries on glibc
FROM node:20-bookworm-slim

ENV NODE_ENV=production

# Set workdir inside backend folder
WORKDIR /app/backend

# Install dependencies first for better caching
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Expose the default dev port (Render provides PORT env at runtime)
EXPOSE 3001

# Run the server
CMD ["npm", "start"]
