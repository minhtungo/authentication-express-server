#!/bin/bash
set -e

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 10

# Run the setup script to initialize bucket and CORS
echo "Setting up MinIO bucket..."
npm run setup-minio

# Start the application
echo "Starting the application..."
exec "$@" 