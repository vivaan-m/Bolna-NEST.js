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
  provider: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}

// DTO for LLM configuration
class LlmConfigDto {
  @IsString()
  provider: string;

  @IsString()
  model: string;

  @IsOptional()
  temperature?: number;

  @IsOptional()
  maxTokens?: number;

  @IsObject()
  @IsOptional()
  options?: Record<string, any>;

  @IsString()
  @IsOptional()
  systemPrompt?: string;
}

// DTO for TTS configuration
class TtsConfigDto {
  @IsString()
  provider: string;

  @IsString()
  @IsOptional()
  voice?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}

// DTO for extraction tool configuration
class ExtractionToolConfigDto {
  @IsObject()
  llm_agent: {
    extraction_details: string;
    extraction_json?: string;
  };
}

// DTO for classification tool configuration
class ClassificationToolConfigDto {
  @IsObject()
  llm_agent: {
    classification_details: string;
    classification_json?: string;
    classes: string[];
  };
}

// DTO for custom tool configuration
class CustomToolConfigDto {
  @IsString()
  function_name: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;
}

// DTO for task configuration
class TaskConfigDto {
  @IsEnum(TaskType)
  task_type: TaskType;

  @IsString()
  task_name: string;

  @IsObject()
  tools_config: ExtractionToolConfigDto | ClassificationToolConfigDto | CustomToolConfigDto;

  @IsBoolean()
  enabled: boolean;
}

// DTO for memory configuration
class MemoryConfigDto {
  @IsString()
  type: 'short_term' | 'long_term' | 'both';

  @IsOptional()
  max_messages?: number;

  @IsString()
  @IsOptional()
  storage_type?: 'redis' | 'file';
}

// DTO for agent configuration
class AgentConfigDto implements AgentConfig {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => AsrConfigDto)
  asr: AsrConfigDto;

  @ValidateNested()
  @Type(() => LlmConfigDto)
  llm: LlmConfigDto;

  @ValidateNested()
  @Type(() => TtsConfigDto)
  tts: TtsConfigDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskConfigDto)
  @IsOptional()
  tasks?: TaskConfigDto[];

  @ValidateNested()
  @Type(() => MemoryConfigDto)
  @IsOptional()
  memory?: MemoryConfigDto;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  assistant_status?: string;
}

// DTO for conversation details
class ConversationDetailsDto implements ConversationDetails {
  @IsString()
  @IsOptional()
  system_prompt?: string;

  @IsObject()
  @IsOptional()
  user_prompt_templates?: Record<string, string>;

  @IsObject()
  @IsOptional()
  assistant_prompt_templates?: Record<string, string>;
}

// DTO for creating an agent
class CreateAgentDto {
  @ValidateNested()
  @Type(() => AgentConfigDto)
  config: AgentConfigDto;

  @ValidateNested()
  @Type(() => ConversationDetailsDto)
  @IsOptional()
  conversation_details?: ConversationDetailsDto;
}

// DTO for updating an agent
class UpdateAgentDto {
  @ValidateNested()
  @Type(() => AgentConfigDto)
  @IsOptional()
  config?: Partial<AgentConfigDto>;

  @ValidateNested()
  @Type(() => ConversationDetailsDto)
  @IsOptional()
  conversation_details?: ConversationDetailsDto;
}

@Controller('agents')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  @Post()
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