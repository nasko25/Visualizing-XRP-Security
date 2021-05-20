FROM node:14

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install

# install nmap
RUN apt-get update
RUN apt-get install nmap -y

# For building the code for production use:
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Default React and HTTP test ports
EXPOSE 8080

CMD npm start

