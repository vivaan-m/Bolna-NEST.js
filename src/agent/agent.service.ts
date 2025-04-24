import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { LlmService, Message } from '../llm/llm.service';

// Define task types
export enum TaskType {
  EXTRACTION = 'extraction',
  CLASSIFICATION = 'classification',
  CUSTOM = 'custom',
}

// Define tool types
export enum ToolType {
  LLM_AGENT = 'llm_agent',
  API = 'api',
  FUNCTION = 'function',
}

// Define ASR configuration
export interface AsrConfig {
  provider: string;
  model?: string;
  language?: string;
  options?: Record<string, any>;
}

// Define LLM configuration
export interface LlmConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  options?: Record<string, any>;
  systemPrompt?: string;
}

// Define TTS configuration
export interface TtsConfig {
  provider: string;
  voice?: string;
  language?: string;
  options?: Record<string, any>;
}

// Define extraction tool configuration
export interface ExtractionToolConfig {
  llm_agent: {
    extraction_details: string;
    extraction_json?: string;
  };
}

// Define classification tool configuration
export interface ClassificationToolConfig {
  llm_agent: {
    classification_details: string;
    classification_json?: string;
    classes: string[];
  };
}

// Define custom tool configuration
export interface CustomToolConfig {
  function_name: string;
  parameters?: Record<string, any>;
}

// Define task configuration
export interface TaskConfig {
  task_type: TaskType;
  task_name: string;
  tools_config: ExtractionToolConfig | ClassificationToolConfig | CustomToolConfig;
  enabled: boolean;
}

// Define memory configuration
export interface MemoryConfig {
  type: 'short_term' | 'long_term' | 'both';
  max_messages?: number;
  storage_type?: 'redis' | 'file';
}

// Define agent configuration
export interface AgentConfig {
  name: string;
  description?: string;
  asr: AsrConfig;
  llm: LlmConfig;
  tts: TtsConfig;
  tasks?: TaskConfig[];
  memory?: MemoryConfig;
  metadata?: Record<string, any>;
  assistant_status?: string;
}

// Define conversation details
export interface ConversationDetails {
  system_prompt?: string;
  user_prompt_templates?: Record<string, string>;
  assistant_prompt_templates?: Record<string, string>;
}

// Define agent
export interface Agent {
  id: string;
  config: AgentConfig;
  conversation_details?: ConversationDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Define extraction prompt generation template
const EXTRACTION_PROMPT_GENERATION_PROMPT = `
You are an expert at creating JSON extraction schemas based on user requirements.
Your task is to create a JSON schema that will be used to extract structured information from conversations.

The user will provide details about what information needs to be extracted.
You should respond with a JSON schema that includes:
1. A description of what the schema is for
2. Properties that need to be extracted, with appropriate types and descriptions
3. Required properties

Example:
If the user wants to extract customer information from a conversation, you might respond with:

{
  "description": "Schema for extracting customer information from conversations",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Customer's full name"
    },
    "email": {
      "type": "string",
      "description": "Customer's email address"
    },
    "issue": {
      "type": "string",
      "description": "Description of the customer's issue"
    },
    "urgency": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "The urgency level of the customer's issue"
    }
  },
  "required": ["name", "issue"]
}

Make sure your schema is valid JSON and includes all necessary information for extraction.
`;

// Define classification prompt generation template
const CLASSIFICATION_PROMPT_GENERATION_PROMPT = `
You are an expert at creating classification schemas based on user requirements.
Your task is to create a classification schema that will be used to categorize conversations.

The user will provide details about what classifications are needed.
You should respond with a JSON schema that includes:
1. A description of what the classification is for
2. The classes that should be used for classification
3. Criteria for each class

Example:
If the user wants to classify customer sentiment, you might respond with:

{
  "description": "Schema for classifying customer sentiment in conversations",
  "classes": ["positive", "neutral", "negative"],
  "criteria": {
    "positive": "Customer expresses satisfaction, gratitude, or positive emotions",
    "neutral": "Customer's tone is matter-of-fact, neither positive nor negative",
    "negative": "Customer expresses frustration, anger, or disappointment"
  }
}

Make sure your schema is valid JSON and includes all necessary information for classification.
`;

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agentDataDir = path.join(process.cwd(), 'agent_data');

  constructor(
    private readonly redisService: RedisService,
    private readonly llmService?: LlmService,
  ) {
    // Create agent data directory if it doesn't exist
    if (!fs.existsSync(this.agentDataDir)) {
      fs.mkdirSync(this.agentDataDir, { recursive: true });
    }
  }

  /**
   * Create a new agent with the given configuration and conversation details
   */
  async createAgent(
    config: AgentConfig, 
    conversationDetails?: ConversationDetails
  ): Promise<Agent> {
    const id = uuidv4();
    const now = new Date();
    
    // Set default status
    config.assistant_status = config.assistant_status || 'created';
    
    // Process tasks if they exist
    if (config.tasks && config.tasks.length > 0) {
      await this.processTasks(config.tasks);
    }
    
    const agent: Agent = {
      id,
      config,
      conversation_details: conversationDetails,
      createdAt: now,
      updatedAt: now,
    };
    
    // Store agent in Redis
    await this.redisService.set(`agent:${id}`, agent);
    
    // Store conversation details in file system if provided
    if (conversationDetails) {
      await this.storeConversationDetails(id, conversationDetails);
    }
    
    this.logger.log(`Created agent with ID: ${id}`);
    
    // Add agent ID to the list of all agents
    await this.redisService.sadd('agents', id);
    
    return agent;
  }

  /**
   * Get an agent by ID
   */
  async getAgent(id: string): Promise<Agent | null> {
    const agent = await this.redisService.get(`agent:${id}`);
    
    if (!agent) {
      return null;
    }
    
    // Load conversation details from file system
    try {
      const conversationDetails = await this.loadConversationDetails(id);
      if (conversationDetails) {
        agent.conversation_details = conversationDetails;
      }
    } catch (error) {
      this.logger.warn(`Failed to load conversation details for agent ${id}: ${error.message}`);
    }
    
    return agent;
  }

  /**
   * Update an existing agent
   */
  async updateAgent(
    id: string, 
    config: Partial<AgentConfig>,
    conversationDetails?: ConversationDetails
  ): Promise<Agent | null> {
    const agent = await this.getAgent(id);
    
    if (!agent) {
      return null;
    }
    
    // Update status
    config.assistant_status = config.assistant_status || 'updated';
    
    // Process tasks if they exist
    if (config.tasks && config.tasks.length > 0) {
      await this.processTasks(config.tasks);
    }
    
    const updatedAgent: Agent = {
      ...agent,
      config: {
        ...agent.config,
        ...config,
      },
      updatedAt: new Date(),
    };
    
    // Update conversation details if provided
    if (conversationDetails) {
      updatedAgent.conversation_details = conversationDetails;
      await this.storeConversationDetails(id, conversationDetails);
    }
    
    await this.redisService.set(`agent:${id}`, updatedAgent);
    this.logger.log(`Updated agent with ID: ${id}`);
    
    return updatedAgent;
  }

  /**
   * Delete an agent by ID
   */
  async deleteAgent(id: string): Promise<boolean> {
    const exists = await this.redisService.exists(`agent:${id}`);
    
    if (!exists) {
      return false;
    }
    
    // Delete agent from Redis
    await this.redisService.delete(`agent:${id}`);
    
    // Remove agent ID from the list of all agents
    await this.redisService.srem('agents', id);
    
    // Delete conversation details file if it exists
    try {
      const agentDir = path.join(this.agentDataDir, id);
      if (fs.existsSync(agentDir)) {
        fs.rmSync(agentDir, { recursive: true, force: true });
      }
    } catch (error) {
      this.logger.warn(`Failed to delete conversation details for agent ${id}: ${error.message}`);
    }
    
    this.logger.log(`Deleted agent with ID: ${id}`);
    
    return true;
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<Agent[]> {
    const agentIds = await this.redisService.smembers('agents');
    
    if (!agentIds || agentIds.length === 0) {
      return [];
    }
    
    const agents: Agent[] = [];
    
    for (const id of agentIds) {
      const agent = await this.getAgent(id);
      if (agent) {
        agents.push(agent);
      }
    }
    
    return agents;
  }

  /**
   * Process tasks for an agent
   */
  private async processTasks(tasks: TaskConfig[]): Promise<void> {
    if (!this.llmService) {
      this.logger.warn('LLM service not available, skipping task processing');
      return;
    }
    
    for (const task of tasks) {
      if (task.task_type === TaskType.EXTRACTION) {
        const extractionConfig = task.tools_config as ExtractionToolConfig;
        
        if (!extractionConfig.llm_agent.extraction_json && extractionConfig.llm_agent.extraction_details) {
          try {
            const messages: Message[] = [
              { role: 'system', content: EXTRACTION_PROMPT_GENERATION_PROMPT },
              { role: 'user', content: extractionConfig.llm_agent.extraction_details },
            ];
            
            const response = await this.llmService.generateResponse(messages, {
              provider: 'openai',
              model: 'gpt-4',
              temperature: 0.2,
              maxTokens: 2000,
            });
            
            extractionConfig.llm_agent.extraction_json = response.text;
          } catch (error) {
            this.logger.error(`Failed to generate extraction JSON: ${error.message}`);
          }
        }
      } else if (task.task_type === TaskType.CLASSIFICATION) {
        const classificationConfig = task.tools_config as ClassificationToolConfig;
        
        if (!classificationConfig.llm_agent.classification_json && classificationConfig.llm_agent.classification_details) {
          try {
            const messages: Message[] = [
              { role: 'system', content: CLASSIFICATION_PROMPT_GENERATION_PROMPT },
              { role: 'user', content: classificationConfig.llm_agent.classification_details },
            ];
            
            const response = await this.llmService.generateResponse(messages, {
              provider: 'openai',
              model: 'gpt-4',
              temperature: 0.2,
              maxTokens: 2000,
            });
            
            classificationConfig.llm_agent.classification_json = response.text;
          } catch (error) {
            this.logger.error(`Failed to generate classification JSON: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Store conversation details for an agent
   */
  private async storeConversationDetails(agentId: string, details: ConversationDetails): Promise<void> {
    const agentDir = path.join(this.agentDataDir, agentId);
    
    // Create agent directory if it doesn't exist
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    
    const filePath = path.join(agentDir, 'conversation_details.json');
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(details, null, 2));
      this.logger.debug(`Stored conversation details for agent ${agentId}`);
    } catch (error) {
      this.logger.error(`Failed to store conversation details for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load conversation details for an agent
   */
  private async loadConversationDetails(agentId: string): Promise<ConversationDetails | null> {
    const filePath = path.join(this.agentDataDir, agentId, 'conversation_details.json');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as ConversationDetails;
    } catch (error) {
      this.logger.error(`Failed to load conversation details for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }
}