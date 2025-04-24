import { Injectable, Logger } from '@nestjs/common';
import { AgentService, Agent, AgentConfig } from '../agent.service';
import { MemoryService } from '../memory/memory.service';
import { TaskService, TaskResult } from '../tasks/task.service';
import { LlmService, Message } from '../../llm/llm.service';
import { AsrService, AsrResult } from '../../asr/asr.service';
import { TtsService } from '../../tts/tts.service';

export interface AgentResponse {
  text: string;
  audio?: Buffer;
  taskResults?: TaskResult[];
}

@Injectable()
export class AgentManagerService {
  private readonly logger = new Logger(AgentManagerService.name);
  private readonly conversations = new Map<string, Message[]>();

  constructor(
    private readonly agentService: AgentService,
    private readonly memoryService: MemoryService,
    private readonly taskService: TaskService,
    private readonly llmService: LlmService,
    private readonly asrService: AsrService,
    private readonly ttsService: TtsService,
  ) {}

  /**
   * Process audio input for an agent
   */
  async processAudio(
    agentId: string, 
    audioData: Buffer,
    streamResponse?: (chunk: Buffer) => void
  ): Promise<AgentResponse> {
    try {
      // Get the agent
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      // Transcribe audio
      const transcription = await this.asrService.transcribe(audioData, agent.config.asr);
      
      // Process the transcription
      return this.processText(agentId, transcription.text, streamResponse);
    } catch (error) {
      this.logger.error(`Error processing audio for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process text input for an agent
   */
  async processText(
    agentId: string, 
    text: string,
    streamResponse?: (chunk: Buffer) => void
  ): Promise<AgentResponse> {
    try {
      // Get the agent
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      // Get or initialize conversation
      let conversation = this.conversations.get(agentId);
      
      if (!conversation) {
        conversation = [];
        
        // Add system prompt if available
        if (agent.config.llm.systemPrompt) {
          conversation.push({
            role: 'system',
            content: agent.config.llm.systemPrompt,
          });
        } else if (agent.conversation_details?.system_prompt) {
          conversation.push({
            role: 'system',
            content: agent.conversation_details.system_prompt,
          });
        }
        
        this.conversations.set(agentId, conversation);
      }
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: text,
      };
      
      conversation.push(userMessage);
      
      // Store in memory if configured
      if (agent.config.memory) {
        await this.memoryService.addMessage(agentId, userMessage, agent.config.memory);
      }
      
      // Generate response
      let assistantResponse: string;
      
      if (streamResponse) {
        // Stream response
        let fullResponse = '';
        
        await this.llmService.streamResponse(
          conversation,
          agent.config.llm,
          (chunk) => {
            fullResponse += chunk;
          }
        );
        
        assistantResponse = fullResponse;
      } else {
        // Generate response in one go
        const response = await this.llmService.generateResponse(
          conversation,
          agent.config.llm
        );
        
        assistantResponse = response.text;
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse,
      };
      
      conversation.push(assistantMessage);
      
      // Store in memory if configured
      if (agent.config.memory) {
        await this.memoryService.addMessage(agentId, assistantMessage, agent.config.memory);
      }
      
      // Execute tasks if configured
      let taskResults: TaskResult[] = [];
      
      if (agent.config.tasks && agent.config.tasks.length > 0) {
        taskResults = await Promise.all(
          agent.config.tasks
            .filter(task => task.enabled)
            .map(task => this.taskService.executeTask(task, conversation))
        );
      }
      
      // Synthesize speech
      let audioBuffer: Buffer | undefined;
      
      if (streamResponse) {
        // Stream synthesis
        await this.ttsService.streamSynthesize(
          assistantResponse,
          agent.config.tts,
          streamResponse
        );
      } else {
        // Synthesize in one go
        audioBuffer = await this.ttsService.synthesize(
          assistantResponse,
          agent.config.tts
        );
      }
      
      return {
        text: assistantResponse,
        audio: audioBuffer,
        taskResults,
      };
    } catch (error) {
      this.logger.error(`Error processing text for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reset the conversation for an agent
   */
  async resetConversation(agentId: string): Promise<void> {
    try {
      this.conversations.delete(agentId);
      
      // Get the agent
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent || !agent.config.memory) {
        return;
      }
      
      // Clear memory
      await this.memoryService.clearMemory(agentId, agent.config.memory);
    } catch (error) {
      this.logger.error(`Error resetting conversation for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the conversation history for an agent
   */
  async getConversationHistory(agentId: string): Promise<Message[]> {
    try {
      // Get the agent
      const agent = await this.agentService.getAgent(agentId);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      // Get conversation from memory if configured
      if (agent.config.memory) {
        return this.memoryService.getMessages(agentId, agent.config.memory);
      }
      
      // Otherwise, return the in-memory conversation
      return this.conversations.get(agentId) || [];
    } catch (error) {
      this.logger.error(`Error getting conversation history for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }
}