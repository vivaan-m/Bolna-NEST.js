# Socket.IO Implementation in Bolna-Nest

This document describes the Socket.IO implementation in the Bolna-Nest project, which provides real-time communication capabilities for voice AI applications.

## Overview

The Socket.IO implementation enables real-time communication between clients and the Bolna server for voice AI applications. It supports:

- Audio streaming from client to server
- Audio streaming from server to client
- Text messaging
- Interruption handling

## Key Components

### 1. WebSocket Gateway (`websocket.gateway.ts`)

The WebSocket gateway is the main entry point for Socket.IO connections. It:

- Handles client connections and disconnections
- Processes incoming messages
- Routes messages to the appropriate handlers
- Sends responses back to clients

### 2. WebSocket Module (`websocket.module.ts`)

The NestJS module that provides the WebSocket gateway and its dependencies.

### 3. Client Example (`socketio-client-example.js`)

A JavaScript client example that demonstrates how to connect to the Socket.IO server and exchange messages.

### 4. Telephony Integration (`telephony/providers/twilio`)

Integration with telephony providers like Twilio to enable voice calls over Socket.IO.

## Message Flow

1. **Client Connection**:
   - Client connects to `http://server/chat/v1` with query parameter `agentId`
   - Server accepts connection and associates it with the agent ID
   - Server sends welcome message if available

2. **Audio Processing**:
   - Client emits 'audio' event with base64-encoded audio data
   - Server transcribes audio using ASR service
   - Server processes transcription with LLM service
   - Server synthesizes response with TTS service
   - Server emits 'audio' events with audio response chunks

3. **Text Processing**:
   - Client emits 'text' event with text message
   - Server processes text with LLM service
   - Server synthesizes response with TTS service
   - Server emits 'audio' events with audio response chunks

4. **Interruption Handling**:
   - Client or server can emit a 'clear' event
   - Recipient stops current audio playback

## Event Types

### Client to Server Events

- `audio`: Send audio data (base64 encoded)
  ```javascript
  socket.emit('audio', {
    data: base64AudioString,
    meta_info: {
      stream_sid: 'optional-stream-id'
    }
  });
  ```

- `text`: Send text message
  ```javascript
  socket.emit('text', {
    data: 'Hello, how can I help you?'
  });
  ```

- `clear`: Signal to clear current audio playback
  ```javascript
  socket.emit('clear');
  ```

### Server to Client Events

- `audio`: Audio data (base64 encoded)
  ```javascript
  socket.on('audio', (message) => {
    // message.data contains base64 audio
    // message.meta_info contains metadata
  });
  ```

- `text`: Text message
  ```javascript
  socket.on('text', (message) => {
    // message.data contains text
  });
  ```

- `error`: Error message
  ```javascript
  socket.on('error', (message) => {
    // message.message contains error text
  });
  ```

- `clear`: Signal to clear current audio playback
  ```javascript
  socket.on('clear', () => {
    // Stop audio playback
  });
  ```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm run start:dev
   ```

3. Connect to the Socket.IO endpoint:
   ```javascript
   const socket = io('http://localhost:3000/chat/v1', {
     query: {
       agentId: 'your-agent-id'
     }
   });
   ```

## Testing

You can test the Socket.IO implementation using:
- The provided client example (`socketio-client-example.js`)
- Socket.IO client libraries in various languages
- Browser-based tools like Socket.IO tester

## Advantages of Socket.IO over Raw WebSockets

1. **Automatic Reconnection**: Socket.IO automatically attempts to reconnect if the connection is lost
2. **Fallback Transport**: Falls back to long-polling if WebSockets aren't available
3. **Room Support**: Built-in support for rooms and namespaces
4. **Acknowledgements**: Support for acknowledgement callbacks
5. **Structured Events**: Event-based API instead of message-based

## Telephony Integration Considerations

For telephony providers like Twilio that require raw WebSockets:
1. Implement a separate WebSocket endpoint for telephony
2. Use a WebSocket adapter for that specific endpoint
3. Convert between Socket.IO events and raw WebSocket messages

## Differences from Original Bolna

While the overall functionality is the same, there are some differences:
1. Uses Socket.IO instead of raw WebSockets
2. Event-based API instead of message type field
3. Uses query parameters for agent ID instead of URL path
4. More structured error handling