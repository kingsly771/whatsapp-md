FROM node:18-alpine

WORKDIR /app

# Install dependencies (Bailey has fewer dependencies than Puppeteer)
RUN apk add --no-cache \
    curl \
    wget \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S whatsappbot -u 1001

# Change ownership
RUN chown -R whatsappbot:nodejs /app
USER whatsappbot

EXPOSE 3000

CMD ["node", "index.js"]
