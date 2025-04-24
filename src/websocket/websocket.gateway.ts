import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AgentService } from '../agent/agent.service';
import { AgentManagerService } from '../agent/manager/agent-manager.service';

interface ClientData {
  socket: Socket;
  agentId?: string;
  callId?: string;
  provider?: string;
  streamSid?: string;
}

@WebSocketGateway({
  namespace: 'chat/v1',
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private readonly clients = new Map<string, ClientData>();

  constructor(
    private readonly agentService: AgentService,
    private readonly agentManagerService: AgentManagerService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract agent ID from handshake query or params
    const agentId = client.handshake.query.agentId as string || 
                    client.handshake.auth.agentId;
    
    if (!agentId) {
      this.logger.error('No agent ID provided');
      client.emit('error', { message: 'No agent ID provided' });
      client.disconnect();
      return;
    }
    
    this.logger.log(`Agent ID: ${agentId}`);
    
    // Store client data
    this.clients.set(client.id, { 
      socket: client,
      agentId
    });
    
    // Check if agent exists
    try {
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        client.emit('error', { message: `Agent with ID ${agentId} not found` });
        client.disconnect();
        return;
      }
      
      // Reset conversation for the agent
      await this.agentManagerService.resetConversation(agentId);
      
      // Send welcome message if available
      if (agent.conversation_details?.system_prompt) {
        const welcomeMessage = agent.conversation_details.system_prompt
          .split('[WELCOME_MESSAGE]')[1]?.trim();
        
        if (welcomeMessage) {
          // Process welcome message
          const response = await this.agentManagerService.processText(
            agentId,
            welcomeMessage,
            (chunk) => {
              this.sendAudioChunk(client, chunk);
            }
          );
          
          this.sendTextMessage(client, response.text);
        }
      }
    } catch (error) {
      this.logger.error(`Error initializing connection: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Get client data
    const clientData = this.clients.get(client.id);
    
    // Reset conversation if agent is registered
    if (clientData?.agentId) {
      this.agentManagerService.resetConversation(clientData.agentId)
        .catch(error => this.logger.error(`Error resetting conversation: ${error.message}`));
    }
    
    this.clients.delete(client.id);
  }

  @SubscribeMessage('audio')
  async handleAudioMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: { data: string, meta_info?: any }
  ) {
    const clientData = this.clients.get(client.id);
    
    if (!clientData?.agentId) {
      client.emit('error', { message: 'No agent ID associated with this connection' });
      return;
    }
    
    try {
      // Extract stream SID from meta_info if present
      if (message.meta_info?.stream_sid) {
        clientData.streamSid = message.meta_info.stream_sid;
      }
      
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(message.data, 'base64');
      
      // Process audio with agent manager
      const response = await this.agentManagerService.processAudio(
        clientData.agentId,
        audioBuffer,
        (chunk) => {
          this.sendAudioChunk(client, chunk, clientData.streamSid);
        }
      );
      
      // Send final text response
      this.sendTextMessage(client, response.text);
    } catch (error) {
      this.logger.error(`Error processing audio: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('text')
  async handleTextMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: { data: string }
  ) {
    const clientData = this.clients.get(client.id);
    
    if (!clientData?.agentId) {
      client.emit('error', { message: 'No agent ID associated with this connection' });
      return;
    }
    
    try {
      // Process text with agent manager
      const response = await this.agentManagerService.processText(
        clientData.agentId,
        message.data,
        (chunk) => {
          this.sendAudioChunk(client, chunk, clientData.streamSid);
        }
      );
      
      // Send final text response
      this.sendTextMessage(client, response.text);
    } catch (error) {
      this.logger.error(`Error processing text: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('clear')
  async handleClearMessage(@ConnectedSocket() client: Socket) {
    const clientData = this.clients.get(client.id);
    
    if (!clientData?.agentId) {
      client.emit('error', { message: 'No agent ID associated with this connection' });
      return;
    }
    
    try {
      // Send clear message to client
      client.emit('clear', { data: null });
    } catch (error) {
      this.logger.error(`Error handling clear message: ${error.message}`);
    }
  }

  private sendAudioChunk(client: Socket, chunk: Buffer, streamSid?: string) {
    const base64Audio = chunk.toString('base64');
    
    client.emit('audio', {
      data: base64Audio,
      meta_info: {
        format: 'wav',
        sequence_id: Date.now(),
        is_first_chunk: false,
        end_of_llm_stream: false,
        end_of_synthesizer_stream: false,
        cached: false,
        message_category: 'agent_response',
        stream_sid: streamSid
      }
    });
  }

  private sendTextMessage(client: Socket, text: string) {
    client.emit('text', {
      data: text
    });
  }
}