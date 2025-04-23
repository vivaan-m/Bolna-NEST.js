#!/bin/bash

# Check if the containers are already running
if sudo docker compose ps | grep -q "bolna-nest-app"; then
  echo "Containers are already running. Restarting..."
  sudo docker compose restart
else
  # Build and start the containers
  echo "Building and starting containers..."
  sudo docker compose up -d
fi

# Wait for the application to start
echo "Waiting for the application to start..."
sleep 10

# Test the API
echo "Testing the API..."
curl -s http://localhost:3000 | grep -q "Bolna"
if [ $? -eq 0 ]; then
  echo "✅ API is running successfully!"
else
  echo "❌ API test failed!"
fi

# Check Redis connection
echo "Checking Redis connection..."
sudo docker compose exec redis redis-cli ping | grep -q "PONG"
if [ $? -eq 0 ]; then
  echo "✅ Redis is running successfully!"
else
  echo "❌ Redis test failed!"
fi

# Show logs
echo "Showing recent logs..."
sudo docker compose logs --tail=20

echo "Tests completed. Use 'sudo docker compose down' to stop the containers when done."