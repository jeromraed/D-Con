# Frontend Dockerfile
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build for production
RUN npm run build

# Install serve for production static file serving
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the built app (uses $PORT from Railway, fallback to 5173)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-5173}"]
