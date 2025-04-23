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
}

@WebSocketGateway({
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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, { socket: client });
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

  @SubscribeMessage('register')
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: string, callId?: string, provider?: string }
  ) {
    try {
      const { agentId, callId, provider } = data;
      
      this.logger.log(`Registering client ${client.id} with agent ${agentId}`);
      
      // Check if agent exists
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        client.emit('error', { message: `Agent with ID ${agentId} not found` });
        return;
      }
      
      // Update client data
      this.clients.set(client.id, {
        socket: client,
        agentId,
        callId,
        provider,
      });
      
      // Reset conversation for the agent
      await this.agentManagerService.resetConversation(agentId);
      
      client.emit('registered', { 
        agentId,
        agent: {
          name: agent.config.name,
          description: agent.config.description,
        }
      });
      
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
              client.emit('audio-chunk', { audio: chunk.toString('base64') });
            }
          );
          
          client.emit('message', { 
            role: 'assistant', 
            content: response.text,
            taskResults: response.taskResults,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error registering client: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('audio')
  async handleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { audio: string }
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData?.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(data.audio, 'base64');
      
      // Process audio with agent manager
      const response = await this.agentManagerService.processAudio(
        clientData.agentId,
        audioBuffer,
        (chunk) => {
          client.emit('audio-chunk', { audio: chunk.toString('base64') });
        }
      );
      
      // Send response
      client.emit('message', { 
        role: 'assistant', 
        content: response.text,
        taskResults: response.taskResults,
      });
    } catch (error) {
      this.logger.error(`Error processing audio: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('text')
  async handleText(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string }
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData?.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      // Send user message to client
      client.emit('message', { 
        role: 'user', 
        content: data.text 
      });
      
      // Process text with agent manager
      const response = await this.agentManagerService.processText(
        clientData.agentId,
        data.text,
        (chunk) => {
          client.emit('audio-chunk', { audio: chunk.toString('base64') });
        }
      );
      
      // Send response
      client.emit('message', { 
        role: 'assistant', 
        content: response.text,
        taskResults: response.taskResults,
      });
    } catch (error) {
      this.logger.error(`Error processing text: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('reset')
  async handleReset(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData?.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      // Reset conversation
      await this.agentManagerService.resetConversation(clientData.agentId);
      
      client.emit('reset', { success: true });
    } catch (error) {
      this.logger.error(`Error resetting conversation: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('history')
  async handleHistory(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData?.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      // Get conversation history
      const history = await this.agentManagerService.getConversationHistory(clientData.agentId);
      
      client.emit('history', { messages: history });
    } catch (error) {
      this.logger.error(`Error getting conversation history: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('end-call')
  async handleEndCall(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData?.callId || !clientData?.provider) {
        client.emit('error', { message: 'No active call to end' });
        return;
      }
      
      // In a real implementation, you would call the telephony service to end the call
      client.emit('call-ended', { callId: clientData.callId });
      
      // Clear call data
      this.clients.set(client.id, {
        ...clientData,
        callId: undefined,
        provider: undefined,
      });
    } catch (error) {
      this.logger.error(`Error ending call: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}