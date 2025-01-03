FROM node:18

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .
COPY package*.json ./
RUN npm ci --only=production
# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
