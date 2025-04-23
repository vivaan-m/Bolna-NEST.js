# Docker Setup for Bolna Nest.js

This document explains the Docker setup for the Bolna Nest.js application.

## Files Created

1. **Dockerfile.api**: Defines the build process for the API server.
2. **Dockerfile.telephony**: Defines the build process for the Telephony server.
3. **compose.yaml**: Orchestrates the API, Telephony, and Redis services.
4. **.dockerignore**: Excludes unnecessary files from the Docker build context.
5. **docker-run.sh**: A helper script to build and run the Docker containers.
6. **docker-test.sh**: A script to test the Docker setup.
7. **tsconfig.telephony.json**: TypeScript configuration for the Telephony server.

## Docker Setup

The Docker setup consists of three services:

1. **api**: The main API server
   - Built from the Dockerfile.api
   - Exposes port 3000
   - Connects to Redis
   - Uses environment variables from .env file
   - Handles API requests, agent management, etc.

2. **telephony**: The Telephony server
   - Built from the Dockerfile.telephony
   - Exposes port 3001
   - Connects to Redis
   - Uses environment variables from .env file
   - Handles telephony-related operations (Twilio, Plivo)
   - Designed to handle higher load for call processing

3. **redis**: Redis database
   - Uses the official Redis Alpine image
   - Persists data using a Docker volume
   - Exposes port 6379
   - Used for communication between API and Telephony servers

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