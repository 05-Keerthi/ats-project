
# ---------- Build Stage ----------
FROM node:20-bullseye AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install to avoid host-arch issues
RUN rm -rf node_modules package-lock.json && npm cache clean --force && npm install

# Explicitly install Rollup Linux binary to fix npm optional dep issue
RUN npm install @rollup/rollup-linux-x64-gnu --save-dev

# Copy all source files
COPY . .

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_BASE_NAME
ARG NODE_ENV

# Set environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_NAME=$VITE_BASE_NAME
ENV NODE_ENV=$NODE_ENV

# Build the project
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
