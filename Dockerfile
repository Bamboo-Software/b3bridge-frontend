# Use the official Node.js 20 slim image as the base image for the build stage
FROM node:20-slim AS builder

# Set environment variables for PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Set the working directory inside the container
WORKDIR /app

# Enable corepack to manage package managers
# RUN corepack enable && corepack use pnpm@latest-10
RUN npm install -g pnpm@latest-10

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install dependencies using PNPM with cache mount for better performance
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm install --frozen-lockfile --ignore-scripts


# Copy the rest of the application code to the working directory
COPY . /app

# Build the application
RUN pnpm run build

# Use the official NGINX Alpine image as the base image for the runtime stage
FROM nginx:alpine AS runtime

# Copy custom NGINX configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default NGINX static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app from the previous stage to NGINX's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Default command to run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
