import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery,
  ApiProperty
} from '@nestjs/swagger';
import { 
  AgentService, 
  AgentConfig, 
  ConversationDetails,
  TaskType,
  TaskConfig
} from './agent.service';
import { IsString, IsOptional, IsObject, ValidateNested, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for ASR configuration
class AsrConfigDto {
  @IsString()
  @ApiProperty({
    description: 'ASR provider name',
    example: 'whisper',
    required: true
  })
  provider: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'ASR model name',
    example: 'whisper-1',
    required: false
  })
  model?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Language for ASR',
    example: 'en-US',
    required: false
  })
  language?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional options for ASR',
    example: { timeout: 30 },
    required: false
  })
  options?: Record<string, any>;
}

// DTO for LLM configuration
class LlmConfigDto {
  @IsString()
  @ApiProperty({
    description: 'LLM provider name',
    example: 'openai',
    required: true
  })
  provider: string;

  @IsString()
  @ApiProperty({
    description: 'LLM model name',
    example: 'gpt-4',
    required: true
  })
  model: string;

  @IsOptional()
  @ApiProperty({
    description: 'Temperature for LLM generation',
    example: 0.7,
    required: false
  })
  temperature?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Maximum tokens for LLM generation',
    example: 1000,
    required: false
  })
  maxTokens?: number;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional options for LLM',
    example: { top_p: 0.9 },
    required: false
  })
  options?: Record<string, any>;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'System prompt for LLM',
    example: 'You are a helpful assistant.',
    required: false
  })
  systemPrompt?: string;
}

// DTO for TTS configuration
class TtsConfigDto {
  @IsString()
  @ApiProperty({
    description: 'TTS provider name',
    example: 'elevenlabs',
    required: true
  })
  provider: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Voice for TTS',
    example: 'rachel',
    required: false
  })
  voice?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Language for TTS',
    example: 'en-US',
    required: false
  })
  language?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional options for TTS',
    example: { speed: 1.0 },
    required: false
  })
  options?: Record<string, any>;
}

// DTO for extraction tool configuration
class ExtractionToolConfigDto {
  @IsObject()
  @ApiProperty({
    description: 'LLM agent configuration for extraction',
    example: {
      extraction_details: 'Extract customer information',
      extraction_json: '{ "name": "string", "email": "string", "issue": "string" }'
    },
    required: true
  })
  llm_agent: {
    extraction_details: string;
    extraction_json?: string;
  };
}

// DTO for classification tool configuration
class ClassificationToolConfigDto {
  @IsObject()
  @ApiProperty({
    description: 'LLM agent configuration for classification',
    example: {
      classification_details: 'Classify customer sentiment',
      classification_json: '{ "sentiment": "string" }',
      classes: ['positive', 'neutral', 'negative']
    },
    required: true
  })
  llm_agent: {
    classification_details: string;
    classification_json?: string;
    classes: string[];
  };
}

// DTO for custom tool configuration
class CustomToolConfigDto {
  @IsString()
  @ApiProperty({
    description: 'Function name for custom tool',
    example: 'searchKnowledgeBase',
    required: true
  })
  function_name: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Parameters for custom tool',
    example: { query: 'product information' },
    required: false
  })
  parameters?: Record<string, any>;
}

// DTO for task configuration
class TaskConfigDto {
  @IsEnum(TaskType)
  @ApiProperty({
    description: 'Type of task',
    enum: TaskType,
    example: TaskType.EXTRACTION,
    required: true
  })
  task_type: TaskType;

  @IsString()
  @ApiProperty({
    description: 'Name of the task',
    example: 'Extract customer information',
    required: true
  })
  task_name: string;

  @IsObject()
  @ApiProperty({
    description: 'Configuration for the task tools',
    required: true,
    oneOf: [
      { $ref: '#/components/schemas/ExtractionToolConfigDto' },
      { $ref: '#/components/schemas/ClassificationToolConfigDto' },
      { $ref: '#/components/schemas/CustomToolConfigDto' }
    ]
  })
  tools_config: ExtractionToolConfigDto | ClassificationToolConfigDto | CustomToolConfigDto;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the task is enabled',
    example: true,
    required: true
  })
  enabled: boolean;
}

// DTO for memory configuration
class MemoryConfigDto {
  @IsString()
  @ApiProperty({
    description: 'Type of memory',
    enum: ['short_term', 'long_term', 'both'],
    example: 'both',
    required: true
  })
  type: 'short_term' | 'long_term' | 'both';

  @IsOptional()
  @ApiProperty({
    description: 'Maximum number of messages to store',
    example: 100,
    required: false
  })
  max_messages?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Storage type for memory',
    enum: ['redis', 'file'],
    example: 'redis',
    required: false
  })
  storage_type?: 'redis' | 'file';
}

// DTO for agent configuration
class AgentConfigDto implements AgentConfig {
  @IsString()
  @ApiProperty({
    description: 'Name of the agent',
    example: 'Customer Support Agent',
    required: true
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Description of the agent',
    example: 'An agent that helps customers with their inquiries',
    required: false
  })
  description?: string;

  @ValidateNested()
  @Type(() => AsrConfigDto)
  @ApiProperty({
    description: 'ASR configuration',
    type: () => AsrConfigDto,
    required: true
  })
  asr: AsrConfigDto;

  @ValidateNested()
  @Type(() => LlmConfigDto)
  @ApiProperty({
    description: 'LLM configuration',
    type: () => LlmConfigDto,
    required: true
  })
  llm: LlmConfigDto;

  @ValidateNested()
  @Type(() => TtsConfigDto)
  @ApiProperty({
    description: 'TTS configuration',
    type: () => TtsConfigDto,
    required: true
  })
  tts: TtsConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskConfigDto)
  @IsOptional()
  @ApiProperty({
    description: 'Tasks for the agent',
    type: [TaskConfigDto],
    required: false
  })
  tasks?: TaskConfigDto[];

  @ValidateNested()
  @Type(() => MemoryConfigDto)
  @IsOptional()
  @ApiProperty({
    description: 'Memory configuration',
    type: () => MemoryConfigDto,
    required: false
  })
  memory?: MemoryConfigDto;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional metadata',
    example: { industry: 'healthcare', version: '1.0' },
    required: false
  })
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Status of the assistant',
    example: 'created',
    required: false
  })
  assistant_status?: string;
}

// DTO for conversation details
class ConversationDetailsDto implements ConversationDetails {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'System prompt for the conversation',
    example: 'You are a helpful customer support agent.',
    required: false
  })
  system_prompt?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Templates for user prompts',
    example: { greeting: 'Hello, I need help with {{issue}}' },
    required: false
  })
  user_prompt_templates?: Record<string, string>;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Templates for assistant prompts',
    example: { greeting: 'Hello! I\'d be happy to help you with {{issue}}.' },
    required: false
  })
  assistant_prompt_templates?: Record<string, string>;
}

// DTO for creating an agent
class CreateAgentDto {
  @ValidateNested()
  @Type(() => AgentConfigDto)
  @ApiProperty({
    description: 'Agent configuration',
    type: () => AgentConfigDto,
    required: true
  })
  config: AgentConfigDto;

  @ValidateNested()
  @Type(() => ConversationDetailsDto)
  @IsOptional()
  @ApiProperty({
    description: 'Conversation details',
    type: () => ConversationDetailsDto,
    required: false
  })
  conversation_details?: ConversationDetailsDto;
}

// DTO for updating an agent
class UpdateAgentDto {
  @ValidateNested()
  @Type(() => AgentConfigDto)
  @IsOptional()
  @ApiProperty({
    description: 'Agent configuration to update',
    type: () => AgentConfigDto,
    required: false
  })
  config?: Partial<AgentConfigDto>;

  @ValidateNested()
  @Type(() => ConversationDetailsDto)
  @IsOptional()
  @ApiProperty({
    description: 'Conversation details to update',
    type: () => ConversationDetailsDto,
    required: false
  })
  conversation_details?: ConversationDetailsDto;
}

@ApiTags('agents')
@Controller('agents')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiBody({ type: AgentConfigDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The agent has been successfully created.',
    type: AgentConfigDto
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createAgent(@Body(new ValidationPipe({ transform: true })) body: AgentConfigDto) {
    try {
      // Set default values
      body.assistant_status = body.assistant_status || 'created';
      
      return await this.agentService.createAgent(body);
    } catch (error) {
      this.logger.error(`Error creating agent: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to create agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: '3023054d-5519-4cbf-acf4-146f54396b1b' })
  @ApiResponse({ 
    status: 200, 
    description: 'The agent has been successfully retrieved.',
    type: AgentConfigDto
  })
  @ApiResponse({ status: 404, description: 'Agent not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAgent(@Param('id') id: string) {
    try {
      const agent = await this.agentService.getAgent(id);
      
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      
      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error getting agent ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to get agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: '3023054d-5519-4cbf-acf4-146f54396b1b' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The agent has been successfully updated.',
    type: AgentConfigDto
  })
  @ApiResponse({ status: 404, description: 'Agent not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateAgent(
    @Param('id') id: string, 
    @Body(new ValidationPipe({ transform: true })) updateAgentDto: UpdateAgentDto
  ) {
    try {
      const agent = await this.agentService.updateAgent(
        id, 
        updateAgentDto.config || {}, 
        updateAgentDto.conversation_details
      );
      
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      
      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error updating agent ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to update agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: '3023054d-5519-4cbf-acf4-146f54396b1b' })
  @ApiResponse({ 
    status: 200, 
    description: 'The agent has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Agent 3023054d-5519-4cbf-acf4-146f54396b1b deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Agent not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteAgent(@Param('id') id: string) {
    try {
      const deleted = await this.agentService.deleteAgent(id);
      
      if (!deleted) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      
      return { success: true, message: `Agent ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error deleting agent ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to delete agent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all agents' })
  @ApiQuery({ name: 'limit', description: 'Number of agents to return', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: 'Number of agents to skip', required: false, type: Number })
  @ApiQuery({ 
    name: 'sort', 
    description: 'Sort field and order (e.g., name:asc, config.llm.model:desc)', 
    required: false, 
    type: String 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of agents',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 10 },
        limit: { type: 'number', example: 5 },
        offset: { type: 'number', example: 0 },
        agents: { 
          type: 'array', 
          items: { $ref: '#/components/schemas/AgentConfigDto' }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async listAgents(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: string
  ) {
    try {
      const agents = await this.agentService.listAgents();
      
      // Apply pagination if provided
      let result = agents;
      
      if (offset !== undefined) {
        const startIndex = Number(offset) || 0;
        result = result.slice(startIndex);
      }
      
      if (limit !== undefined) {
        const limitNum = Number(limit) || 10;
        result = result.slice(0, limitNum);
      }
      
      // Apply sorting if provided
      if (sort) {
        const [field, order] = sort.split(':');
        
        result.sort((a, b) => {
          let valueA: any;
          let valueB: any;
          
          // Handle nested fields
          if (field.includes('.')) {
            const parts = field.split('.');
            valueA = parts.reduce((obj, key) => obj?.[key], a);
            valueB = parts.reduce((obj, key) => obj?.[key], b);
          } else {
            valueA = a[field];
            valueB = b[field];
          }
          
          // Handle different types
          if (typeof valueA === 'string') {
            return order === 'desc' 
              ? valueB.localeCompare(valueA) 
              : valueA.localeCompare(valueB);
          } else {
            return order === 'desc' 
              ? valueB - valueA 
              : valueA - valueB;
          }
        });
      }
      
      return {
        total: agents.length,
        limit: limit ? Number(limit) : agents.length,
        offset: offset ? Number(offset) : 0,
        agents: result,
      };
    } catch (error) {
      this.logger.error(`Error listing agents: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to list agents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}