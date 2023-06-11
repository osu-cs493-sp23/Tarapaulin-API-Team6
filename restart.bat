@echo off
docker rm --force mysql-server
docker rmi mysql
docker run -d --name mysql-server --network final-sql-net -p "3306:3306" -e "MYSQL_RANDOM_ROOT_PASSWORD=yes" -e "MYSQL_DATABASE=tarp" -e "MYSQL_USER=tarp" -e "MYSQL_PASSWORD=hunter2" mysql