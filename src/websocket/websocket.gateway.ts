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
import { AsrService } from '../asr/asr.service';
import { LlmService, Message } from '../llm/llm.service';
import { TtsService } from '../tts/tts.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private readonly clients = new Map<string, { 
    socket: Socket, 
    agentId?: string,
    conversation: Message[],
    callId?: string,
    provider?: string
  }>();

  constructor(
    private readonly agentService: AgentService,
    private readonly asrService: AsrService,
    private readonly llmService: LlmService,
    private readonly ttsService: TtsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, { 
      socket: client,
      conversation: []
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
      
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        client.emit('error', { message: `Agent with ID ${agentId} not found` });
        return;
      }
      
      const clientData = this.clients.get(client.id);
      
      if (clientData) {
        this.clients.set(client.id, {
          ...clientData,
          agentId,
          callId,
          provider,
          conversation: [
            {
              role: 'system',
              content: agent.config.llm.systemPrompt || 'You are a helpful assistant.',
            },
          ],
        });
      }
      
      client.emit('registered', { agentId });
    } catch (error) {
      this.logger.error(`Error registering client: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('audio')
  async handleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { audio: Buffer }
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData || !clientData.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      const agent = await this.agentService.getAgent(clientData.agentId);
      
      if (!agent) {
        client.emit('error', { message: `Agent with ID ${clientData.agentId} not found` });
        return;
      }
      
      // Process audio with ASR
      const asrResult = await this.asrService.transcribe(data.audio, agent.config.asr);
      
      if (asrResult.text.trim() === '') {
        return;
      }
      
      client.emit('transcript', { text: asrResult.text, isFinal: asrResult.isFinal });
      
      if (!asrResult.isFinal) {
        return;
      }
      
      // Add user message to conversation
      clientData.conversation.push({
        role: 'user',
        content: asrResult.text,
      });
      
      // Generate response with LLM
      let fullResponse = '';
      
      await this.llmService.streamResponse(
        clientData.conversation,
        agent.config.llm,
        (chunk) => {
          client.emit('llm-chunk', { text: chunk });
          fullResponse += chunk;
        }
      );
      
      // Add assistant message to conversation
      clientData.conversation.push({
        role: 'assistant',
        content: fullResponse,
      });
      
      // Synthesize speech with TTS
      await this.ttsService.streamSynthesize(
        fullResponse,
        agent.config.tts,
        (chunk) => {
          client.emit('audio-chunk', { audio: chunk });
        }
      );
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
      
      if (!clientData || !clientData.agentId) {
        client.emit('error', { message: 'Client not registered with an agent' });
        return;
      }
      
      const agent = await this.agentService.getAgent(clientData.agentId);
      
      if (!agent) {
        client.emit('error', { message: `Agent with ID ${clientData.agentId} not found` });
        return;
      }
      
      // Add user message to conversation
      clientData.conversation.push({
        role: 'user',
        content: data.text,
      });
      
      // Generate response with LLM
      let fullResponse = '';
      
      await this.llmService.streamResponse(
        clientData.conversation,
        agent.config.llm,
        (chunk) => {
          client.emit('llm-chunk', { text: chunk });
          fullResponse += chunk;
        }
      );
      
      // Add assistant message to conversation
      clientData.conversation.push({
        role: 'assistant',
        content: fullResponse,
      });
      
      // Synthesize speech with TTS
      await this.ttsService.streamSynthesize(
        fullResponse,
        agent.config.tts,
        (chunk) => {
          client.emit('audio-chunk', { audio: chunk });
        }
      );
    } catch (error) {
      this.logger.error(`Error processing text: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('end-call')
  async handleEndCall(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const clientData = this.clients.get(client.id);
      
      if (!clientData || !clientData.callId || !clientData.provider) {
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