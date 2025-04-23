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
var TaskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent.service");
const llm_service_1 = require("../../llm/llm.service");
let TaskService = TaskService_1 = class TaskService {
    llmService;
    logger = new common_1.Logger(TaskService_1.name);
    constructor(llmService) {
        this.llmService = llmService;
    }
    async executeTask(task, conversation) {
        try {
            if (!task.enabled) {
                return {
                    task_name: task.task_name,
                    task_type: task.task_type,
                    result: null,
                    success: false,
                    error: 'Task is disabled',
                };
            }
            switch (task.task_type) {
                case agent_service_1.TaskType.EXTRACTION:
                    return this.executeExtractionTask(task, conversation);
                case agent_service_1.TaskType.CLASSIFICATION:
                    return this.executeClassificationTask(task, conversation);
                case agent_service_1.TaskType.CUSTOM:
                    return this.executeCustomTask(task, conversation);
                default:
                    throw new Error(`Unsupported task type: ${task.task_type}`);
            }
        }
        catch (error) {
            this.logger.error(`Error executing task ${task.task_name}: ${error.message}`);
            return {
                task_name: task.task_name,
                task_type: task.task_type,
                result: null,
                success: false,
                error: error.message,
            };
        }
    }
    async executeExtractionTask(task, conversation) {
        const extractionConfig = task.tools_config;
        if (!extractionConfig.llm_agent.extraction_json) {
            throw new Error('Extraction JSON is missing');
        }
        const extractionPrompt = `
You are an AI assistant tasked with extracting structured information from a conversation.
Extract the information according to the following JSON schema:

${extractionConfig.llm_agent.extraction_json}

The conversation is provided below. Extract all relevant information that matches the schema.
If a required field cannot be found, use null or an appropriate default value.
Return ONLY the extracted JSON without any additional text, explanations, or markdown formatting.

CONVERSATION:
${conversation.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}
`;
        const extractionResult = await this.llmService.generateResponse([{ role: 'user', content: extractionPrompt }], {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.1,
            maxTokens: 2000,
        });
        try {
            const extractedData = JSON.parse(extractionResult.text);
            return {
                task_name: task.task_name,
                task_type: task.task_type,
                result: extractedData,
                success: true,
            };
        }
        catch (error) {
            throw new Error(`Failed to parse extraction result: ${error.message}`);
        }
    }
    async executeClassificationTask(task, conversation) {
        const classificationConfig = task.tools_config;
        if (!classificationConfig.llm_agent.classification_json) {
            throw new Error('Classification JSON is missing');
        }
        const classificationPrompt = `
You are an AI assistant tasked with classifying a conversation.
Classify the conversation according to the following schema:

${classificationConfig.llm_agent.classification_json}

The conversation is provided below. Determine the most appropriate classification.
Return ONLY the classification result as a single string, without any additional text, explanations, or markdown formatting.
Your response should be one of the following classes: ${classificationConfig.llm_agent.classes.join(', ')}

CONVERSATION:
${conversation.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}
`;
        const classificationResult = await this.llmService.generateResponse([{ role: 'user', content: classificationPrompt }], {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.1,
            maxTokens: 100,
        });
        const result = classificationResult.text.trim();
        if (!classificationConfig.llm_agent.classes.includes(result)) {
            throw new Error(`Classification result "${result}" is not in the list of valid classes`);
        }
        return {
            task_name: task.task_name,
            task_type: task.task_type,
            result,
            success: true,
        };
    }
    async executeCustomTask(task, conversation) {
        const customConfig = task.tools_config;
        this.logger.log(`Executing custom task: ${customConfig.function_name}`);
        return {
            task_name: task.task_name,
            task_type: task.task_type,
            result: {
                function: customConfig.function_name,
                parameters: customConfig.parameters,
                mock: true,
            },
            success: true,
        };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = TaskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LlmService])
], TaskService);
//# sourceMappingURL=task.service.js.map