# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY .npmrc /root/.npmrc
RUN npm ci

COPY . .

# Use the production env file explicitly
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve the built app using nginx
FROM nginx:stable-alpine

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to nginx's public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
