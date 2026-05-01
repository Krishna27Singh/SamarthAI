# Step 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Assuming you are using Vite or standard Create React App
RUN npm run build 

# Step 2: Serve with Nginx
FROM nginx:alpine
# Copy the built assets from the builder stage
# Note: change 'dist' to 'build' if you are using Create React App instead of Vite
COPY --from=builder /app/dist /usr/share/nginx/html 

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]