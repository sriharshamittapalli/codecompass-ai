#!/bin/bash

# Start backend server
cd /app/backend
PORT=8080 node dist/server.js &

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
while ! curl -f http://localhost:8080/health > /dev/null 2>&1; do
  sleep 1
done

echo "✅ CodeCompass AI is running!"
echo "🚀 Backend: http://localhost:8080"
echo "📊 Health: http://localhost:8080/health"

# Keep the container running
wait 