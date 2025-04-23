"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = exports.ToolType = exports.TaskType = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
const llm_service_1 = require("../llm/llm.service");
var TaskType;
(function (TaskType) {
    TaskType["EXTRACTION"] = "extraction";
    TaskType["CLASSIFICATION"] = "classification";
    TaskType["CUSTOM"] = "custom";
})(TaskType || (exports.TaskType = TaskType = {}));
var ToolType;
(function (ToolType) {
    ToolType["LLM_AGENT"] = "llm_agent";
    ToolType["API"] = "api";
    ToolType["FUNCTION"] = "function";
})(ToolType || (exports.ToolType = ToolType = {}));
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
let AgentService = AgentService_1 = class AgentService {
    redisService;
    llmService;
    logger = new common_1.Logger(AgentService_1.name);
    agentDataDir = path.join(process.cwd(), 'agent_data');
    constructor(redisService, llmService) {
        this.redisService = redisService;
        this.llmService = llmService;
        if (!fs.existsSync(this.agentDataDir)) {
            fs.mkdirSync(this.agentDataDir, { recursive: true });
        }
    }
    async createAgent(config, conversationDetails) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        config.assistant_status = config.assistant_status || 'created';
        if (config.tasks && config.tasks.length > 0) {
            await this.processTasks(config.tasks);
        }
        const agent = {
            id,
            config,
            conversation_details: conversationDetails,
            createdAt: now,
            updatedAt: now,
        };
        await this.redisService.set(`agent:${id}`, agent);
        if (conversationDetails) {
            await this.storeConversationDetails(id, conversationDetails);
        }
        this.logger.log(`Created agent with ID: ${id}`);
        await this.redisService.sadd('agents', id);
        return agent;
    }
    async getAgent(id) {
        const agent = await this.redisService.get(`agent:${id}`);
        if (!agent) {
            return null;
        }
        try {
            const conversationDetails = await this.loadConversationDetails(id);
            if (conversationDetails) {
                agent.conversation_details = conversationDetails;
            }
        }
        catch (error) {
            this.logger.warn(`Failed to load conversation details for agent ${id}: ${error.message}`);
        }
        return agent;
    }
    async updateAgent(id, config, conversationDetails) {
        const agent = await this.getAgent(id);
        if (!agent) {
            return null;
        }
        config.assistant_status = config.assistant_status || 'updated';
        if (config.tasks && config.tasks.length > 0) {
            await this.processTasks(config.tasks);
        }
        const updatedAgent = {
            ...agent,
            config: {
                ...agent.config,
                ...config,
            },
            updatedAt: new Date(),
        };
        if (conversationDetails) {
            updatedAgent.conversation_details = conversationDetails;
            await this.storeConversationDetails(id, conversationDetails);
        }
        await this.redisService.set(`agent:${id}`, updatedAgent);
        this.logger.log(`Updated agent with ID: ${id}`);
        return updatedAgent;
    }
    async deleteAgent(id) {
        const exists = await this.redisService.exists(`agent:${id}`);
        if (!exists) {
            return false;
        }
        await this.redisService.delete(`agent:${id}`);
        await this.redisService.srem('agents', id);
        try {
            const agentDir = path.join(this.agentDataDir, id);
            if (fs.existsSync(agentDir)) {
                fs.rmSync(agentDir, { recursive: true, force: true });
            }
        }
        catch (error) {
            this.logger.warn(`Failed to delete conversation details for agent ${id}: ${error.message}`);
        }
        this.logger.log(`Deleted agent with ID: ${id}`);
        return true;
    }
    async listAgents() {
        const agentIds = await this.redisService.smembers('agents');
        if (!agentIds || agentIds.length === 0) {
            return [];
        }
        const agents = [];
        for (const id of agentIds) {
            const agent = await this.getAgent(id);
            if (agent) {
                agents.push(agent);
            }
        }
        return agents;
    }
    async processTasks(tasks) {
        if (!this.llmService) {
            this.logger.warn('LLM service not available, skipping task processing');
            return;
        }
        for (const task of tasks) {
            if (task.task_type === TaskType.EXTRACTION) {
                const extractionConfig = task.tools_config;
                if (!extractionConfig.llm_agent.extraction_json && extractionConfig.llm_agent.extraction_details) {
                    try {
                        const messages = [
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
                    }
                    catch (error) {
                        this.logger.error(`Failed to generate extraction JSON: ${error.message}`);
                    }
                }
            }
            else if (task.task_type === TaskType.CLASSIFICATION) {
                const classificationConfig = task.tools_config;
                if (!classificationConfig.llm_agent.classification_json && classificationConfig.llm_agent.classification_details) {
                    try {
                        const messages = [
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
                    }
                    catch (error) {
                        this.logger.error(`Failed to generate classification JSON: ${error.message}`);
                    }
                }
            }
        }
    }
    async storeConversationDetails(agentId, details) {
        const agentDir = path.join(this.agentDataDir, agentId);
        if (!fs.existsSync(agentDir)) {
            fs.mkdirSync(agentDir, { recursive: true });
        }
        const filePath = path.join(agentDir, 'conversation_details.json');
        try {
            fs.writeFileSync(filePath, JSON.stringify(details, null, 2));
            this.logger.debug(`Stored conversation details for agent ${agentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to store conversation details for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async loadConversationDetails(agentId) {
        const filePath = path.join(this.agentDataDir, agentId, 'conversation_details.json');
        if (!fs.existsSync(filePath)) {
            return null;
        }
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.error(`Failed to load conversation details for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        llm_service_1.LlmService])
], AgentService);
//# sourceMappingURL=agent.service.js.map