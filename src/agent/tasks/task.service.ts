import { Injectable, Logger } from '@nestjs/common';
import { 
  TaskConfig, 
  TaskType, 
  ExtractionToolConfig, 
  ClassificationToolConfig, 
  CustomToolConfig 
} from '../agent.service';
import { LlmService, Message } from '../../llm/llm.service';

export interface TaskResult {
  task_name: string;
  task_type: TaskType;
  result: any;
  success: boolean;
  error?: string;
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Execute a task based on its type and configuration
   */
  async executeTask(
    task: TaskConfig, 
    conversation: Message[]
  ): Promise<TaskResult> {
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
        case TaskType.EXTRACTION:
          return this.executeExtractionTask(task, conversation);
        case TaskType.CLASSIFICATION:
          return this.executeClassificationTask(task, conversation);
        case TaskType.CUSTOM:
          return this.executeCustomTask(task, conversation);
        default:
          throw new Error(`Unsupported task type: ${task.task_type}`);
      }
    } catch (error) {
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

  /**
   * Execute an extraction task
   */
  private async executeExtractionTask(
    task: TaskConfig, 
    conversation: Message[]
  ): Promise<TaskResult> {
    const extractionConfig = task.tools_config as ExtractionToolConfig;
    
    if (!extractionConfig.llm_agent.extraction_json) {
      throw new Error('Extraction JSON is missing');
    }

    // Create a prompt for extraction
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

    // Execute the extraction
    const extractionResult = await this.llmService.generateResponse(
      [{ role: 'user', content: extractionPrompt }],
      {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.1,
        maxTokens: 2000,
      }
    );

    // Parse the extraction result
    try {
      const extractedData = JSON.parse(extractionResult.text);
      
      return {
        task_name: task.task_name,
        task_type: task.task_type,
        result: extractedData,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to parse extraction result: ${error.message}`);
    }
  }

  /**
   * Execute a classification task
   */
  private async executeClassificationTask(
    task: TaskConfig, 
    conversation: Message[]
  ): Promise<TaskResult> {
    const classificationConfig = task.tools_config as ClassificationToolConfig;
    
    if (!classificationConfig.llm_agent.classification_json) {
      throw new Error('Classification JSON is missing');
    }

    // Create a prompt for classification
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

    // Execute the classification
    const classificationResult = await this.llmService.generateResponse(
      [{ role: 'user', content: classificationPrompt }],
      {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.1,
        maxTokens: 100,
      }
    );

    // Validate the classification result
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

  /**
   * Execute a custom task
   */
  private async executeCustomTask(
    task: TaskConfig, 
    conversation: Message[]
  ): Promise<TaskResult> {
    const customConfig = task.tools_config as CustomToolConfig;
    
    // In a real implementation, you would have a registry of custom functions
    // For now, we'll just return a mock result
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
}