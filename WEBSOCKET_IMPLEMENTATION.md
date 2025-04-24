# WebSocket Implementation in Bolna-Nest

This document describes the WebSocket implementation in the Bolna-Nest project, which follows the same pattern as the original Bolna project.

## Overview

The WebSocket implementation enables real-time communication between clients and the Bolna server for voice AI applications. It supports:

- Audio streaming from client to server
- Audio streaming from server to client
- Text messaging
- Interruption handling

## Key Components

### 1. WebSocket Gateway (`websocket.gateway.ts`)

The WebSocket gateway is the main entry point for WebSocket connections. It:

- Handles client connections and disconnections
- Processes incoming messages
- Routes messages to the appropriate handlers
- Sends responses back to clients

### 2. WebSocket Module (`websocket.module.ts`)

The NestJS module that provides the WebSocket gateway and its dependencies.

### 3. WebSocket Adapter Configuration (`main.ts`)

Configures the NestJS application to use the WebSocket adapter instead of the default Socket.io adapter.

### 4. Client Example (`client-example.ts`)

A TypeScript client example that demonstrates how to connect to the WebSocket server and exchange messages.

### 5. Telephony Integration (`telephony/providers/twilio`)

Integration with telephony providers like Twilio to enable voice calls over WebSockets.

## Message Flow

1. **Client Connection**:
   - Client connects to `ws://server/chat/v1/{agent_id}`
   - Server accepts connection and associates it with the agent ID
   - Server sends welcome message if available

2. **Audio Processing**:
   - Client sends audio data as base64-encoded chunks
   - Server transcribes audio using ASR service
   - Server processes transcription with LLM service
   - Server synthesizes response with TTS service
   - Server streams audio response back to client

3. **Text Processing**:
   - Client sends text message
   - Server processes text with LLM service
   - Server synthesizes response with TTS service
   - Server streams audio response back to client

4. **Interruption Handling**:
   - Client or server can send a "clear" message
   - Recipient stops current audio playback

## Message Format

All messages are JSON objects with the following structure:

```json
{
  "type": "message_type",
  "data": "message_data",
  "meta_info": {
    // Optional metadata
  }
}
```

### Message Types

- `audio`: Audio data (base64 encoded)
- `text`: Text data
- `clear`: Signal to clear current audio playback
- `error`: Error message

## Implementation Details

### Native WebSockets vs Socket.io

The implementation uses native WebSockets (via the `ws` package) instead of Socket.io for better compatibility with telephony providers and other clients.

### Agent Management

The WebSocket gateway integrates with the Agent Manager service to:
- Validate agent IDs
- Process audio and text inputs
- Generate responses
- Manage conversation state

### Telephony Integration

The WebSocket implementation is compatible with telephony providers like Twilio and Plivo, allowing for voice calls over WebSockets.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm run start:dev
   ```

3. Connect to the WebSocket endpoint:
   ```
   ws://localhost:3000/chat/v1/{agent_id}
   ```

## Testing

You can test the WebSocket implementation using:
- The provided client example
- WebSocket testing tools like wscat
- Browser-based tools like WebSocket King

## Differences from Original Bolna

While the overall flow is the same, there are some differences in implementation:

1. Uses NestJS framework instead of FastAPI
2. TypeScript instead of Python
3. More structured dependency injection
4. Different module organization

However, the core functionality and message format remain compatible with the original Bolna project.