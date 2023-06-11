@echo off
docker rm --force inspect
docker run --name inspect --rm -it --network mysql-net mysql mysql -h mysql-server -u businessUser -p business