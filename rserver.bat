@echo off
@REM Run this everytime as long as the image exists when testing
@REM Remove any running containers called tarapaulin-api before running the server container from the image tarapaulin-api
docker rm --force tarapaulin-api
docker run --rm --name tarapaulin-api --network final-assignment -p 8000:8000 -e "MONGO_DB_NAME=Tarpaulin" -e "MONGO_ROOT_USER=root" -e "MONGO_ROOT_USERNAME=root" -e "MONGO_ROOT_PASSWORD=password" -e "MONGO_USER=root" -e "MONGO_PASSWORD=password" tarapaulin-api