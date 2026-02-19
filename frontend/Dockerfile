# Frontend Dockerfile
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 5173

# Run development server (for dev mode)
# The --host flag is crucial for Docker networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
