# Bolna - Nest.js Implementation

Bolna is an end-to-end open-source platform for building voice-driven conversational AI agents. This is a Nest.js implementation of the Bolna platform.

## Features

- **Voice Conversations**: Orchestrates voice conversations using ASR, LLM, and TTS providers
- **WebSocket Communication**: Real-time bidirectional communication for voice streaming
- **Modular Architecture**: Easily extensible with new providers for ASR, LLM, and TTS
- **Telephony Integration**: Support for Twilio and Plivo for phone calls
- **Agent Management**: Create, update, and manage voice agents with different configurations

## Architecture

The application is built using Nest.js and follows a modular architecture:

- **Agent Module**: Manages voice agents and their configurations
- **ASR Module**: Handles Automatic Speech Recognition with providers like Deepgram
- **LLM Module**: Processes text with Large Language Models like OpenAI
- **TTS Module**: Converts text to speech using providers like ElevenLabs and AWS Polly
- **Telephony Module**: Integrates with telephony providers like Twilio and Plivo
- **WebSocket Module**: Manages real-time communication for voice streaming
- **Redis Module**: Handles data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Redis server (optional, for production)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your API keys and configuration:
   ```
   # Server Configuration
   PORT=3000

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Deepgram Configuration
   DEEPGRAM_AUTH_TOKEN=your_deepgram_auth_token

   # ElevenLabs Configuration
   ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Plivo Configuration
   PLIVO_AUTH_ID=your_plivo_auth_id
   PLIVO_AUTH_TOKEN=your_plivo_auth_token
   PLIVO_PHONE_NUMBER=your_plivo_phone_number
   ```

### Running the Application

#### Development Mode

```bash
npm run start:dev
```

#### Production Mode

```bash
npm run build
npm run start:prod
```

#### Using Docker

The application can be run using Docker and Docker Compose, which includes both the application and Redis:

1. Build and start the containers:
   ```bash
   sudo docker compose up -d
   ```

2. View logs:
   ```bash
   sudo docker compose logs -f
   ```

3. Stop the containers:
   ```bash
   sudo docker compose down
   ```

## API Endpoints

### Agents

- `POST /agents`: Create a new agent
- `GET /agents/:id`: Get an agent by ID
- `PUT /agents/:id`: Update an agent
- `DELETE /agents/:id`: Delete an agent
- `GET /agents`: List all agents

### Telephony

- `POST /telephony/call`: Initiate a call
- `DELETE /telephony/call/:provider/:callId`: End a call
- `POST /telephony/twilio/webhook`: Twilio webhook endpoint
- `POST /telephony/plivo/webhook`: Plivo webhook endpoint
- `GET /telephony/webhook-url/:provider`: Get webhook URL for a provider

## WebSocket Events

### Client to Server

- `register`: Register with an agent
- `audio`: Send audio data for processing
- `text`: Send text for processing
- `end-call`: End an active call

### Server to Client

- `registered`: Confirmation of registration
- `transcript`: ASR transcript
- `llm-chunk`: LLM response chunk
- `audio-chunk`: TTS audio chunk
- `error`: Error message
- `call-ended`: Confirmation of call end

## License

This project is licensed under the MIT License - see the LICENSE file for details.
