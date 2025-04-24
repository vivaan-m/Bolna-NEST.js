const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const AGENT_ID = process.env.AGENT_ID || '1';

// Create Socket.IO connection
const socket = io(`${SERVER_URL}/chat/v1`, {
  query: {
    agentId: AGENT_ID
  },
  transports: ['websocket', 'polling']
});

// Set up readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle Socket.IO events
socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
  console.log('Type your message and press Enter to send');
  console.log('Type "exit" to close the connection');
  
  // Start reading user input
  readUserInput();
});

socket.on('audio', (message) => {
  console.log('Received audio chunk');
  // In a real application, you would play this audio
  // For this example, we'll save it to a file
  saveAudioChunk(message.data);
});

socket.on('text', (message) => {
  console.log(`Assistant: ${message.data}`);
});

socket.on('error', (message) => {
  console.error(`Error: ${message.message}`);
});

socket.on('clear', () => {
  console.log('Received clear signal - stopping current audio playback');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  rl.close();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Function to read user input
function readUserInput() {
  rl.question('> ', (input) => {
    if (input.toLowerCase() === 'exit') {
      socket.disconnect();
      return;
    }
    
    // Send text message
    socket.emit('text', {
      data: input
    });
    
    // Continue reading input
    readUserInput();
  });
}

// Function to save audio chunks (for demonstration purposes)
function saveAudioChunk(base64Audio) {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const timestamp = Date.now();
    const filePath = path.join(__dirname, `audio_chunk_${timestamp}.wav`);
    
    fs.writeFileSync(filePath, audioBuffer);
    console.log(`Audio chunk saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving audio chunk:', error);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nClosing connection...');
  socket.disconnect();
});