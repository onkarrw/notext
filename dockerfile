# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if applicable)
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]