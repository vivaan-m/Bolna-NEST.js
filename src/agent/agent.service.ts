import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface AgentConfig {
  name: string;
  description?: string;
  asr: {
    provider: string;
    model?: string;
    options?: any;
  };
  llm: {
    provider: string;
    model: string;
    options?: any;
    systemPrompt?: string;
  };
  tts: {
    provider: string;
    voice?: string;
    options?: any;
  };
}

export interface Agent {
  id: string;
  config: AgentConfig;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(private readonly redisService: RedisService) {}

  async createAgent(config: AgentConfig): Promise<Agent> {
    const id = uuidv4();
    const now = new Date();
    
    const agent: Agent = {
      id,
      config,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.redisService.set(`agent:${id}`, agent);
    this.logger.log(`Created agent with ID: ${id}`);
    
    return agent;
  }

  async getAgent(id: string): Promise<Agent | null> {
    return this.redisService.get(`agent:${id}`);
  }

  async updateAgent(id: string, config: Partial<AgentConfig>): Promise<Agent | null> {
    const agent = await this.getAgent(id);
    
    if (!agent) {
      return null;
    }
    
    const updatedAgent: Agent = {
      ...agent,
      config: {
        ...agent.config,
        ...config,
      },
      updatedAt: new Date(),
    };
    
    await this.redisService.set(`agent:${id}`, updatedAgent);
    this.logger.log(`Updated agent with ID: ${id}`);
    
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const exists = await this.redisService.exists(`agent:${id}`);
    
    if (!exists) {
      return false;
    }
    
    await this.redisService.delete(`agent:${id}`);
    this.logger.log(`Deleted agent with ID: ${id}`);
    
    return true;
  }

  async listAgents(): Promise<Agent[]> {
    // This is a simplified implementation
    // In a real-world scenario, you would need a more efficient way to list all agents
    // For example, using Redis SCAN or maintaining a separate index
    return [];
  }
}