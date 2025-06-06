#!/bin/sh
set -e

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_DB" ]; then
  echo "Required environment variables for Postgres are not set."
  exit 1
fi

if [ -z "$MONGO_INITDB_ROOT_USERNAME" ] || [ -z "$MONGO_INITDB_ROOT_PASSWORD" ] || [ -z "$MONGO_HOST" ] || [ -z "$MONGO_INITDB_DATABASE" ]; then
  echo "Required environment variables for MongoDB are not set."
  exit 1
fi

if [ -z "$CASSANDRA_HOST" ] || [ -z "$CASSANDRA_USERNAME" ] || [ -z "$CASSANDRA_PASSWORD" ]; then
  echo "Required environment variables for Cassandra are not set."
  exit 1
fi

echo "Starting migrations..."

echo "Running migration for postgres"
migrate -verbose -path /migrations/postgres -database "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=disable" up

if [ $? -ne 0 ]; then
  echo "Postgres migration failed"
  exit 1
fi

echo "Running migration for mongo"
migrate -verbose -path /migrations/mongodb -database "mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@$MONGO_HOST:27017/$MONGO_INITDB_DATABASE?authSource=admin" up 
if [ $? -ne 0 ]; then
  echo "MongoDB migration failed"
  exit 1
fi

echo "Running migration for cassandra"
migrate -verbose -path /migrations/cassandra -database "cassandra://$CASSANDRA_HOST:9042/techmarket?username=$CASSANDRA_USERNAME&password=$CASSANDRA_PASSWORD&x-multi-statement=true" up
if [ $? -ne 0 ]; then
  echo "Cassandra migration failed"
  exit 1
fi
echo "Migrations completed successfully"
