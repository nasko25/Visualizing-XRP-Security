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

## Geolocation Lookup APIs
The application supports two ways to extract geolocation from the node's IP addresses. The default way is to use an npm module called `geoip-lite`, which loads a geoiplookup table in memory and is therefore really fast.

This however can be a problem if the server code is ran on a virtual server with limited resources (the module's documentation mentions it does not work in the AWS microserver configuration and in the cheapest DigitalOcean droplet). During our testing (which was done from inside the server docker container), the nodejs process required 720MB of virtual memory after loading the module (compared to 608MB before loading the module).

Because of that we have also included [https://ipstack.com/](https://ipstack.com/)'s API as a second option. It does require a free account though (which is limited to 5000 requests per month), so we have chosen the `geoip-lite` module as the default option. To use ipstack.com instead set the `useIPStack` flag in `server/config/config.json` to true and provide an access token (which you get after creating an account in ipstack.com). The benefit of using their API is that almost no extra memory is used (as we perform an HTTP Get request to their servers) and that the information they provide is usually more accurate. But since we perform HTTP requests for each IP, it is a lot slower than using an in-memory geoip resolution table.
