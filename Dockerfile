FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies (including nodemon)
RUN npm install
RUN npm install -g nodemon

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Ensure proper file permissions
RUN chown -R node:node /app

# Step 7: Set environment variables from the .env file (if using)
# These will be overwritten by docker-compose.yml if defined there
ENV PORT=3000
ENV NODE_ENV=development
ENV MONGO_DEV_CONN_URL=mongodb://mongo:27017/freshkart
ENV MONGO_TEST_CONN_URL=mongodb://mongo:27017/freshkart_test
ENV MONGO_PROD_CONN_URL=mongodb://mongo:27017/freshkart_prod

# Step 8: Expose the application port
EXPOSE 3000

# Step 9: Start the application using nodemon
CMD ["npx", "nodemon", "src/app.js"]
