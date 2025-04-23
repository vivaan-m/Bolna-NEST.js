import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';
import { Message } from '../../llm/llm.service';
import { MemoryConfig } from '../agent.service';

/**
 * Service for managing agent conversation memory
 */
@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private readonly memoryDir = path.join(process.cwd(), 'agent_data');

  constructor(private readonly redisService: RedisService) {
    // Create memory directory if it doesn't exist
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  /**
   * Add a message to the agent's memory
   */
  async addMessage(agentId: string, message: Message, config: MemoryConfig): Promise<void> {
    try {
      if (config.type === 'short_term' || config.type === 'both') {
        await this.addToShortTermMemory(agentId, message, config);
      }

      if (config.type === 'long_term' || config.type === 'both') {
        await this.addToLongTermMemory(agentId, message, config);
      }
    } catch (error) {
      this.logger.error(`Error adding message to memory for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get messages from the agent's memory
   */
  async getMessages(agentId: string, config: MemoryConfig): Promise<Message[]> {
    try {
      if (config.type === 'short_term') {
        return this.getShortTermMemory(agentId, config);
      } else if (config.type === 'long_term') {
        return this.getLongTermMemory(agentId, config);
      } else if (config.type === 'both') {
        // Combine short-term and long-term memory
        const shortTermMessages = await this.getShortTermMemory(agentId, config);
        const longTermMessages = await this.getLongTermMemory(agentId, config);
        
        // Deduplicate messages (prefer short-term if duplicate)
        const longTermIds = new Set(shortTermMessages.map(msg => this.getMessageId(msg)));
        const filteredLongTerm = longTermMessages.filter(msg => !longTermIds.has(this.getMessageId(msg)));
        
        return [...shortTermMessages, ...filteredLongTerm];
      }
      
      return [];
    } catch (error) {
      this.logger.error(`Error getting messages from memory for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear the agent's memory
   */
  async clearMemory(agentId: string, config: MemoryConfig): Promise<void> {
    try {
      if (config.type === 'short_term' || config.type === 'both') {
        await this.clearShortTermMemory(agentId);
      }

      if (config.type === 'long_term' || config.type === 'both') {
        await this.clearLongTermMemory(agentId);
      }
    } catch (error) {
      this.logger.error(`Error clearing memory for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a message to short-term memory (Redis)
   */
  private async addToShortTermMemory(agentId: string, message: Message, config: MemoryConfig): Promise<void> {
    const key = `agent:${agentId}:memory:short_term`;
    
    // Get existing messages
    const existingMessages = await this.redisService.get(key) || [];
    
    // Add new message
    existingMessages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    
    // Limit the number of messages if configured
    if (config.max_messages && existingMessages.length > config.max_messages) {
      existingMessages.splice(0, existingMessages.length - config.max_messages);
    }
    
    // Save updated messages
    await this.redisService.set(key, existingMessages);
  }

  /**
   * Get messages from short-term memory (Redis)
   */
  private async getShortTermMemory(agentId: string, config: MemoryConfig): Promise<Message[]> {
    const key = `agent:${agentId}:memory:short_term`;
    const messages = await this.redisService.get(key) || [];
    
    // Limit the number of messages if configured
    if (config.max_messages && messages.length > config.max_messages) {
      return messages.slice(messages.length - config.max_messages);
    }
    
    return messages;
  }

  /**
   * Clear short-term memory (Redis)
   */
  private async clearShortTermMemory(agentId: string): Promise<void> {
    const key = `agent:${agentId}:memory:short_term`;
    await this.redisService.delete(key);
  }

  /**
   * Add a message to long-term memory (File)
   */
  private async addToLongTermMemory(agentId: string, message: Message, config: MemoryConfig): Promise<void> {
    const agentDir = path.join(this.memoryDir, agentId);
    
    // Create agent directory if it doesn't exist
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    
    const memoryFile = path.join(agentDir, 'long_term_memory.json');
    
    // Get existing messages
    let existingMessages: Message[] = [];
    
    if (fs.existsSync(memoryFile)) {
      try {
        const data = fs.readFileSync(memoryFile, 'utf8');
        existingMessages = JSON.parse(data);
      } catch (error) {
        this.logger.error(`Error reading long-term memory file for agent ${agentId}: ${error.message}`);
        // Continue with empty array if file is corrupted
      }
    }
    
    // Add new message
    existingMessages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    
    // Save updated messages
    fs.writeFileSync(memoryFile, JSON.stringify(existingMessages, null, 2));
  }

  /**
   * Get messages from long-term memory (File)
   */
  private async getLongTermMemory(agentId: string, config: MemoryConfig): Promise<Message[]> {
    const memoryFile = path.join(this.memoryDir, agentId, 'long_term_memory.json');
    
    if (!fs.existsSync(memoryFile)) {
      return [];
    }
    
    try {
      const data = fs.readFileSync(memoryFile, 'utf8');
      const messages = JSON.parse(data) as Message[];
      
      // Limit the number of messages if configured
      if (config.max_messages && messages.length > config.max_messages) {
        return messages.slice(messages.length - config.max_messages);
      }
      
      return messages;
    } catch (error) {
      this.logger.error(`Error reading long-term memory file for agent ${agentId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear long-term memory (File)
   */
  private async clearLongTermMemory(agentId: string): Promise<void> {
    const memoryFile = path.join(this.memoryDir, agentId, 'long_term_memory.json');
    
    if (fs.existsSync(memoryFile)) {
      fs.unlinkSync(memoryFile);
    }
  }

  /**
   * Generate a unique ID for a message to help with deduplication
   */
  private getMessageId(message: Message): string {
    return `${message.role}:${message.content}:${message.timestamp || ''}`;
  }
}