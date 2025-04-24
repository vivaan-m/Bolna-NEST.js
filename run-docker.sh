#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create one based on .env.example"
  exit 1
fi

# Build and start the containers
sudo docker-compose up --build -d

# Wait for the containers to start
echo "Waiting for containers to start..."
sleep 5

# Check if the containers are running
if sudo docker-compose ps | grep -q "Up"; then
  echo "Containers are running!"
  echo "API is available at http://localhost:3000"
  echo "WebSocket is available at ws://localhost:3000"
  echo ""
  echo "To view logs, run: sudo docker-compose logs -f"
  echo "To stop the containers, run: sudo docker-compose down"
else
  echo "Error: Containers failed to start. Check the logs with: sudo docker-compose logs"
  exit 1
fi