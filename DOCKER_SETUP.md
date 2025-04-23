# Docker Setup for Bolna Nest.js

This document explains the Docker setup for the Bolna Nest.js application.

## Files Created

1. **Dockerfile**: Defines the build process for the Nest.js application.
2. **docker-compose.yml**: Orchestrates the application and Redis services.
3. **.dockerignore**: Excludes unnecessary files from the Docker build context.
4. **docker-run.sh**: A helper script to build and run the Docker containers.
5. **docker-test.sh**: A script to test the Docker setup.

## Docker Setup

The Docker setup consists of two services:

1. **app**: The Nest.js application
   - Built from the Dockerfile
   - Exposes port 3000
   - Connects to Redis
   - Uses environment variables from .env file

2. **redis**: Redis database
   - Uses the official Redis Alpine image
   - Persists data using a Docker volume
   - Exposes port 6379

## Running with Docker

To run the application with Docker:

1. Make sure Docker and Docker Compose are installed.
2. Create a `.env` file with your API keys (or use the provided `.env.example`).
3. Run the helper script:
   ```bash
   ./docker-run.sh
   ```

Alternatively, you can manually build and run the containers:

```bash
sudo docker compose up -d
```

## Testing the Docker Setup

To test the Docker setup:

```bash
./docker-test.sh
```

This script will:
1. Build and start the containers
2. Test the API endpoint
3. Test the Redis connection
4. Show the logs

## Useful Commands

- View logs: `sudo docker compose logs -f`
- Stop containers: `sudo docker compose down`
- Restart containers: `sudo docker compose restart`
- Access the application: http://localhost:3000

## Environment Variables

The application uses the following environment variables:

- `PORT`: The port the application listens on (default: 3000)
- `REDIS_HOST`: The Redis host (default: redis)
- `REDIS_PORT`: The Redis port (default: 6379)
- `OPENAI_API_KEY`: Your OpenAI API key
- `DEEPGRAM_AUTH_TOKEN`: Your Deepgram authentication token
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `PLIVO_AUTH_ID`: Your Plivo authentication ID
- `PLIVO_AUTH_TOKEN`: Your Plivo authentication token
- `PLIVO_PHONE_NUMBER`: Your Plivo phone number