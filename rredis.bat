@echo off
@REM run this script to run the redis docker container for the node server
docker run -d --name redis-server -p 6379:6379 redis:latest