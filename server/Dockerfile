FROM node:14

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install

# For building the code for production use:
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Default React and HTTP test ports
EXPOSE 8080

CMD npm run run
