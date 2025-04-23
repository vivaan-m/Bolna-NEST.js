# Agent Service Enhancements

## Overview

This update enhances the Agent Service with advanced features for managing conversational agents, including:

- Task processing for extraction and classification
- Conversation memory management
- Agent manager for orchestrating agent behavior
- WebSocket integration for real-time communication

## Key Components

### Agent Service

- Enhanced agent model with support for tasks, memory, and conversation details
- Task processing for extraction and classification using LLMs
- File-based storage for conversation details

### Memory Service

- Support for short-term (Redis) and long-term (file) memory
- Methods for adding, retrieving, and clearing conversation history

### Task Service

- Support for extraction, classification, and custom tasks
- Integration with LLM service for task execution

### Agent Manager Service

- Orchestration of agent behavior
- Processing of audio and text inputs
- Integration with ASR, LLM, and TTS services
- Management of conversation state

### WebSocket Gateway

- Real-time communication with clients
- Support for audio and text inputs
- Streaming of responses

## Usage

### Creating an Agent

```typescript
// Create an agent with tasks and memory
const agent = await agentService.createAgent({
  name: 'Customer Support Agent',
  description: 'An agent that helps customers with their inquiries',
  asr: {
    provider: 'whisper',
    model: 'whisper-1',
  },
  llm: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    systemPrompt: 'You are a helpful customer support agent.',
  },
  tts: {
    provider: 'elevenlabs',
    voice: 'rachel',
  },
  tasks: [
    {
      task_type: TaskType.EXTRACTION,
      task_name: 'Extract customer information',
      tools_config: {
        llm_agent: {
          extraction_details: 'Extract customer name, email, and issue from the conversation',
        },
      },
      enabled: true,
    },
    {
      task_type: TaskType.CLASSIFICATION,
      task_name: 'Classify customer sentiment',
      tools_config: {
        llm_agent: {
          classification_details: 'Classify customer sentiment as positive, neutral, or negative',
          classes: ['positive', 'neutral', 'negative'],
        },
      },
      enabled: true,
    },
  ],
  memory: {
    type: 'both',
    max_messages: 100,
  },
}, {
  system_prompt: 'You are a helpful customer support agent. [WELCOME_MESSAGE] Hello! How can I assist you today?',
  user_prompt_templates: {
    greeting: 'Hello, I need help with {{issue}}',
  },
  assistant_prompt_templates: {
    greeting: 'Hello! I\'d be happy to help you with {{issue}}. Could you please provide more details?',
  },
});
```

### Processing User Input

```typescript
// Process text input
const response = await agentManagerService.processText(
  agentId,
  'I need help with my order',
  (chunk) => {
    // Handle streaming audio response
    socket.emit('audio-chunk', { audio: chunk.toString('base64') });
  }
);

// Process audio input
const response = await agentManagerService.processAudio(
  agentId,
  audioBuffer,
  (chunk) => {
    // Handle streaming audio response
    socket.emit('audio-chunk', { audio: chunk.toString('base64') });
  }
);
```

### WebSocket Communication

```typescript
// Client-side code
const socket = io('http://localhost:3000');

// Register with an agent
socket.emit('register', { agentId: 'agent-id' });

// Send text input
socket.emit('text', { text: 'Hello, I need help with my order' });

// Send audio input
socket.emit('audio', { audio: base64AudioData });

// Listen for responses
socket.on('message', (data) => {
  console.log('Assistant:', data.content);
  console.log('Task results:', data.taskResults);
});

// Listen for audio chunks
socket.on('audio-chunk', (data) => {
  // Play audio chunk
  playAudio(data.audio);
});
```

## Future Enhancements

- Support for more task types
- Integration with external knowledge bases
- Support for multi-agent conversations
- Enhanced memory management with vector databases
- Support for more ASR, LLM, and TTS providers