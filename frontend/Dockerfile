# Frontend Dockerfile
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Accept API URL as build arg (Railway passes env vars as build args)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build for production (VITE_API_URL is baked in here)
RUN npm run build

# Install serve for production static file serving
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the built app (uses $PORT from Railway, fallback to 5173)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-5173}"]

