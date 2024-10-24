# Use an official Node.js runtime image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install --production

# Copy the rest of the bot code into the container
COPY . .

# Define the command to run the bot
CMD ["node", "src/bot.js"]