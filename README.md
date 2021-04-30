# Visualizing Security Metrics for the XRP Digital Asset 

# How to run?
## Running without docker:
To start the server:
```
node app
```
To start the client:
```
cd client
npm start
```

## To build and run the server docker image:
```
docker build . -t <image_name>
docker run -p 8080:8080 -d <image_name>
```

## To build and run the client docker image:
```
docker build . -t <client_image_name>
docker run -p 3000:3000 -d <client_image_name>
```

### Or you can use `docker-compose` to run both:
```
docker-compose build
docker-compose up -d
```
after that you can:
```
docker-compose start/stop/restart
```
