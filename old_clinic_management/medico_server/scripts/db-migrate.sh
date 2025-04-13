#!/bin/bash

# Interactive migration script for Supabase

echo "Medico Server - Database Migration Script"
echo "========================================"
echo ""

# Check if a migration name was provided
if [ -z "$1" ]; then
  echo "Please provide a name for the migration."
  echo "Usage: ./scripts/db-migrate.sh <migration-name>"
  exit 1
fi

# Set the migration name
MIGRATION_NAME=$1

# Validate the connection to Supabase
echo "Validating database connection..."
npx prisma validate

if [ $? -ne 0 ]; then
  echo "Database validation failed. Please check your connection settings."
  exit 1
fi

# Create a new migration
echo "Creating migration: $MIGRATION_NAME"
npx prisma migrate dev --name $MIGRATION_NAME

if [ $? -ne 0 ]; then
  echo "Migration creation failed."
  exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "Migration complete!"
echo "====================" 