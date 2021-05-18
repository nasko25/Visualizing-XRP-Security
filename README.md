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
