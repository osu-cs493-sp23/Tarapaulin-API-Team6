@echo off
@REM Run this once to create the server image
@REM Remove any existing image called final-assignment and then build the server image (called final-assignment) based on the dockerfile
docker image rm --force tarapaulin-api
docker build -t tarapaulin-api .