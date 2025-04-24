import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Configuration
const SERVER_URL = 'ws://localhost:3000/chat/v1';
const AGENT_ID = process.env.AGENT_ID || 'your-agent-id-here';

// Create WebSocket connection
const ws = new WebSocket(`${SERVER_URL}/${AGENT_ID}`);

// Set up readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle WebSocket events
ws.on('open', () => {
  console.log('Connected to WebSocket server');
  console.log('Type your message and press Enter to send');
  console.log('Type "exit" to close the connection');
  
  // Start reading user input
  readUserInput();
});

ws.on('message', (data: WebSocket.Data) => {
  try {
    const message = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'audio':
        console.log('Received audio chunk');
        // In a real application, you would play this audio
        // For this example, we'll save it to a file
        saveAudioChunk(message.data);
        break;
        
      case 'text':
        console.log(`Assistant: ${message.data}`);
        break;
        
      case 'error':
        console.error(`Error: ${message.data}`);
        break;
        
      case 'clear':
        console.log('Received clear signal - stopping current audio playback');
        break;
        
      default:
        console.log(`Received message of type: ${message.type}`);
        console.log(message);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Connection closed');
  rl.close();
  process.exit(0);
});

// Function to read user input
function readUserInput() {
  rl.question('> ', (input) => {
    if (input.toLowerCase() === 'exit') {
      ws.close();
      return;
    }
    
    // Send text message
    const message = {
      type: 'text',
      data: input
    };
    
    ws.send(JSON.stringify(message));
    
    // Continue reading input
    readUserInput();
  });
}

// Function to save audio chunks (for demonstration purposes)
function saveAudioChunk(base64Audio: string) {
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
  ws.close();
});