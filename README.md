# Visualizing Security Metrics for the XRP Digital Asset 

# How to run?
## Running without docker:
To start the server:
```
cd server
npm start
```
To start the client:
```
cd client
npm start
```

## To build and run the server docker image:
```
docker build server/ -t <image_name>
docker run -p 8080:8080 -d <image_name>
```

## To build and run the client docker image:
```
docker build client/ -t <client_image_name>
docker run -p 3000:3000 -d <client_image_name>
```

### Or you can use `docker-compose` to run all three containers:
#### Note: when running the containers with `docker-compose` you need to separately run the database container to ensure that it starts before the server container
```
docker-compose build
docker-compose up -d db
docker-compose up -d server client
```
or
```
docker-compose up --build db
docker-compose up --build server client
```
after that you can:
```
docker-compose start/stop/restart
```
## Running the components separetely
The server application consists of several components
1. The Network Crawler and Geolocation Lookup
2. The Port Scanner
3. The API
4. The Metric Calculators

You can run them separetly by calling
```
cd server
node app.js api - for the api
node app.js portScanner - for the port scanner
node app.js crawler - for the crawler
```

running simply
```
cd server
node app.js
```
will start all the components and establish the interprocess communication.

## Running the unit tests
Build all the files to javascript.
Then Run:
```
cd server
tsc --project ./
npm t
```

## Geolocation Lookup APIs
The application supports two ways to extract geolocation from the node's IP addresses. The default way is to use an npm module called `geoip-lite`, which loads a geoiplookup table in memory and is therefore really fast.

This however can be a problem if the server code is ran on a virtual server with limited resources (the module's documentation mentions it does not work in the AWS microserver configuration and in the cheapest DigitalOcean droplet). During our testing (which was done from inside the server docker container), the nodejs process required 720MB of virtual memory after loading the module (compared to 608MB before loading the module).

Because of that we have also included [https://ipstack.com/](https://ipstack.com/)'s API as a second option. It does require a free account though (which is limited to 5000 requests per month), so we have chosen the `geoip-lite` module as the default option. To use ipstack.com instead set the `useIPStack` flag in `server/config/config.json` to true and provide an access token (which you get after creating an account in ipstack.com). The benefit of using their API is that almost no extra memory is used (as we perform an HTTP Get request to their servers) and that the information they provide is usually more accurate. But since we perform HTTP requests for each IP, it is a lot slower than using an in-memory geoip resolution table.


## The PortScanner

The PortScanner uses NMAP for finding open ports of a given address. The docker image comes with nmap, however, if the application is ran separately, it needs to be on a machine that has NMAP. 

It has two modes of execution.
One is the Long Scan which checks the entire port range (0-65535) for any open ones. It can be extremely slow, taking more than a day for each IP address. Several addresses are checked at the same time, however we restrict the parallel executions to M (where M is defined by the client), so as to avoid spawning too many processes, as every NMAP scan is ran in a separate process.
The other is the Short Scan which checks only the N most used tcp ports (where N is defined by the user in the config file). Several addresses are checked at the same time, however we restrict the parallel executions to M (where M is defined by the client), so as to avoid spawning too many processes, as every NMAP scan is ran in a separate process. This is much faster and can take about 20 minutes per address.
Both scans are scheduled for every X days (where X is specified by the user to be days to wait before running next set of scans, i.e. to check all IPs of a given list). The exact time during the day when the scans starts is set at random, so as to ensure that the findings are not time dependant. For example a certain port being in use only during the evenings.
