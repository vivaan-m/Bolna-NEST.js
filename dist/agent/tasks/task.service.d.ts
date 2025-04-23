import { TaskConfig, TaskType } from '../agent.service';
import { LlmService, Message } from '../../llm/llm.service';
export interface TaskResult {
    task_name: string;
    task_type: TaskType;
    result: any;
    success: boolean;
    error?: string;
}
export declare class TaskService {
    private readonly llmService;
    private readonly logger;
    constructor(llmService: LlmService);
    executeTask(task: TaskConfig, conversation: Message[]): Promise<TaskResult>;
    private executeExtractionTask;
    private executeClassificationTask;
    private executeCustomTask;
}
