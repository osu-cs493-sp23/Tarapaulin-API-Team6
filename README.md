[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-7f7980b617ed060a017424585567c406b6ee15c891e84e1186181d67ecf80aa0.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=11145240)


# Set up
Make sure to follow the order when creating the containers!
**Note:** bat files only work on windows]

## Create a Docker network
Run `docker network create --driver bridge final-assignment` to create a docker network called `final-assignment`

## Set up MongoDb
To create and run the mongo container, run `./rmongo.bat`

### Inspect MongoDB
To inspect the mongodb, run 
1. `docker exec -it mongo-server /bin/bash` on the terminal
2. `mongosh --username root --password password --authenticationDatabase admin`
3. `use Tarpaulin`

You should now be able to inspect the MongoDb collections

## Set up Redis
To create and run the redis server, run `./rredis.bat`

## Start the Server
On the terminal, run `npm start`

## Init the db
On a different terminal, run `npm run initdb` to initialize the db

