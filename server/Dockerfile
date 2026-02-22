FROM node:20-alpine
WORKDIR /app

# Copy package files and install
COPY package.json ./
RUN npm install --production

# Copy server code
COPY server.js ./

# Expose the socket port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
