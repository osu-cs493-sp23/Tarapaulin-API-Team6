@echo off
docker container run -d --name mongo-server --network final-assignment -p 27017:27017 -e "MONGO_INITDB_ROOT_USERNAME=root" -e "MONGO_INITDB_ROOT_PASSWORD=password" mongo
docker exec -it mongo-server /bin/bash