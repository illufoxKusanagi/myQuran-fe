# Use official Bun image as base since Vite/Vue run perfectly under Bun
FROM oven/bun:1

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package.json bun.lock tsconfig*.json ./

# Install all dependencies
RUN bun install

# Command to run Vite dev server
# Relies on vite server.host true configured in vite.config.ts
CMD ["bun", "run", "dev"]
