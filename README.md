# YT-STATS

Build the docker images:

1. Build the frontend image
Navigate to the `youtube-stats` directory and run:
```
docker build -t youtube-stats-frontend
```
2. Build the backend image

Navigate to the `youtube-stats-backend` directory and run:
```
docker build -t youtube-stats-backend
```

## Start all services
In `yt-stats` directory, run the following command:
```
docker compose up
```