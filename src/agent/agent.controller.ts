import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { AgentService, AgentConfig } from './agent.service';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  async createAgent(@Body() config: AgentConfig) {
    return this.agentService.createAgent(config);
  }

  @Get(':id')
  async getAgent(@Param('id') id: string) {
    const agent = await this.agentService.getAgent(id);
    
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return agent;
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() config: Partial<AgentConfig>) {
    const agent = await this.agentService.updateAgent(id, config);
    
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return agent;
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    const deleted = await this.agentService.deleteAgent(id);
    
    if (!deleted) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return { success: true };
  }

  @Get()
  async listAgents() {
    return this.agentService.listAgents();
  }
}