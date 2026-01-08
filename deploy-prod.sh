#!/bin/bash

set -e

echo "🚀 Building production image..."
docker build -f Dockerfile.prod -t chat-to-sms-frontend:latest .

echo "🏃 Starting production container..."
docker run -d \
  --name frontend-prod \
  --restart unless-stopped \
  -p 3001:3001 \
  chat-to-sms-frontend:latest

echo "✅ Production deployment complete!"
echo "🌐 App running at: http://localhost:3001"