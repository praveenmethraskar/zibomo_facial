FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to install dependencies
COPY package*.json ./

# Uninstall unwanted packages and install aws-sdk
RUN npm uninstall @azure/ms-rest-azure-js @azure/cognitiveservices-face && \
    npm install aws-sdk --save

# Install only production dependencies (This will also install aws-sdk if it's not already in package.json)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
