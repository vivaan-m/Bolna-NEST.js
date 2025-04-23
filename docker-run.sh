#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists, if not, create it from .env.example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit the .env file to add your API keys."
fi

# No need to rebuild the application, it will be built inside the container

# Build and start the containers
echo "Building and starting containers..."
sudo docker compose up -d --build

# Wait for the application to start (longer wait time for building)
echo "Waiting for the application to start (this may take a minute)..."
sleep 30

# Check if the API server is running
echo "Checking if the API server is running..."
if curl -s http://localhost:3000 | grep -q "Bolna"; then
    echo "✅ API server is running successfully!"
    echo "You can access the API server at http://localhost:3000"
else
    echo "❌ API server failed to start. Please check the logs with 'sudo docker compose logs api'"
fi

# Check if the Telephony server is running
echo "Checking if the Telephony server is running..."
if curl -s http://localhost:3001 | grep -q "Bolna"; then
    echo "✅ Telephony server is running successfully on port 3001"
else
    echo "❌ Telephony server failed to start. Please check the logs with 'sudo docker compose logs telephony'"
fi

echo ""
echo "Useful commands:"
echo "  - View logs: sudo docker compose logs -f"
echo "  - Stop containers: sudo docker compose down"
echo "  - Restart containers: sudo docker compose restart"
echo ""