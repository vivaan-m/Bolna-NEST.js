import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class TwilioWebsocketService {
  private readonly logger = new Logger(TwilioWebsocketService.name);
  private readonly bolnaHost: string;

  constructor(private readonly configService: ConfigService) {
    this.bolnaHost = this.configService.get<string>('BOLNA_HOST', 'http://localhost:3000');
  }

  /**
   * Generate TwiML for connecting to Bolna WebSocket
   * Note: Twilio requires a raw WebSocket URL, not Socket.IO
   * For Twilio integration, you'll need to implement a WebSocket adapter
   */
  generateTwiML(agentId: string): string {
    // For Twilio, we need a raw WebSocket endpoint
    // This is a placeholder - you'll need to implement a WebSocket endpoint for Twilio
    const twilioWebsocketUrl = `${this.bolnaHost.replace('http', 'ws')}/telephony/twilio/stream/${agentId}`;
    this.logger.log(`Generating TwiML with WebSocket URL: ${twilioWebsocketUrl}`);

    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${twilioWebsocketUrl}" />
        </Connect>
      </Response>
    `;
  }

  /**
   * Create a Socket.IO client that connects to Bolna
   * This can be used for testing or for server-initiated calls
   */
  async createSocketIOClient(agentId: string): Promise<Socket> {
    this.logger.log(`Connecting to Socket.IO: ${this.bolnaHost}/chat/v1`);

    return new Promise((resolve, reject) => {
      const socket = io(`${this.bolnaHost}/chat/v1`, {
        query: {
          agentId
        },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        this.logger.log('Socket.IO connection established');
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        this.logger.error(`Socket.IO connection error: ${error.message}`);
        reject(error);
      });

      // Set up basic message handling
      socket.on('audio', (message) => {
        this.logger.debug(`Received audio message`);
      });

      socket.on('text', (message) => {
        this.logger.debug(`Received text message: ${message.data}`);
      });

      socket.on('error', (message) => {
        this.logger.error(`Received error message: ${message.message}`);
      });
    });
  }

  /**
   * Send audio data to the Socket.IO server
   */
  sendAudio(socket: Socket, audioData: Buffer, streamSid: string): void {
    if (!socket.connected) {
      this.logger.error('Socket.IO is not connected');
      return;
    }

    socket.emit('audio', {
      data: audioData.toString('base64'),
      meta_info: {
        stream_sid: streamSid,
        format: 'mulaw',
        sequence_id: Date.now(),
      }
    });
  }

  /**
   * Send text data to the Socket.IO server
   */
  sendText(socket: Socket, text: string): void {
    if (!socket.connected) {
      this.logger.error('Socket.IO is not connected');
      return;
    }

    socket.emit('text', {
      data: text
    });
  }

  /**
   * Close the Socket.IO connection
   */
  closeConnection(socket: Socket): void {
    if (socket.connected) {
      socket.disconnect();
      this.logger.log('Socket.IO connection closed');
    }
  }
}