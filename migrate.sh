#!/bin/sh
set -e

if ! command -v migrate >/dev/null 2>&1; then
  echo "migrate command not found"
  exit 1
fi
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_DB" ]; then
  echo "Required environment variables for Postgres are not set."
  exit 1
fi
if [ -z "$MONGO_INITDB_ROOT_USERNAME" ] || [ -z "$MONGO_INITDB_ROOT_PASSWORD" ] || [ -z "$MONGO_HOST" ] || [ -z "$MONGO_INITDB_DATABASE" ]; then
  echo "Required environment variables for MongoDB are not set."
  exit 1
fi
echo "Starting migrations..."
echo "Running migration for postgres"
migrate -path /migrations/postgres -database "postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB?sslmode=disable" up

if [ $? -ne 0 ]; then
  echo "Postgres migration failed"
  exit 1
fi
echo "Running migration for mongo"

migrate -path /migrations/mongodb -database "mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@$MONGO_HOST:27017/$MONGO_INITDB_DATABASE?authSource=admin" up
if [ $? -ne 0 ]; then
  echo "MongoDB migration failed"
  exit 1
fi
echo "Migrations completed successfully"