FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (optional - app works without them)
RUN npm install --only=production 2>/dev/null || true

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "server/index.js"]

# Labels
LABEL maintainer="VedicAladdin Team"
LABEL description="🔱 VedicAladdin V7 - Offline NASDAQ Vedic Intelligence"
LABEL version="7.0.0"
