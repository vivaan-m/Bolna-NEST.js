# Bolna WebSocket Implementation

This directory contains the WebSocket implementation for Bolna, which enables real-time communication between clients and the Bolna server for voice AI applications.

## Overview

The WebSocket implementation follows the same pattern as the original Bolna project, using native WebSockets instead of Socket.io for better compatibility with telephony providers and other clients.

## WebSocket Endpoint

The main WebSocket endpoint is:

```
ws://localhost:3000/chat/v1/{agent_id}
```

Where `{agent_id}` is the ID of the agent you want to connect to.

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

## Client Example

A TypeScript client example is provided in `client-example.ts`. To use it:

1. Install dependencies:
   ```
   npm install ws
   ```

2. Set the agent ID:
   ```
   export AGENT_ID=your-agent-id
   ```

3. Run the client:
   ```
   ts-node client-example.ts
   ```

## Telephony Integration

The WebSocket implementation is compatible with telephony providers like Twilio and Plivo. See the `telephony` directory for provider-specific implementations.

### Twilio Integration

To use with Twilio:

1. Configure your Twilio webhook URL to point to:
   ```
   https://your-server.com/telephony/twilio/connect?agentId=your-agent-id
   ```

2. The server will respond with TwiML that connects to the Bolna WebSocket.

## Implementation Details

- `websocket.gateway.ts`: The main WebSocket gateway that handles connections and messages
- `websocket.module.ts`: The NestJS module that provides the WebSocket gateway
- `main.ts`: Configures the application to use the WebSocket adapter

## Differences from Socket.io

This implementation uses native WebSockets instead of Socket.io, which means:

1. No automatic reconnection (clients must implement this)
2. No namespaces (uses path parameters instead)
3. No rooms (managed manually)
4. No acknowledgements (use message IDs if needed)

## Testing

You can test the WebSocket implementation using tools like:

- The provided client example
- WebSocket testing tools like [wscat](https://github.com/websockets/wscat)
- Browser-based tools like [WebSocket King](https://websocketking.com/)