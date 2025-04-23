import { AgentService, AgentConfig } from './agent.service';
export declare class AgentController {
    private readonly agentService;
    constructor(agentService: AgentService);
    createAgent(config: AgentConfig): Promise<import("./agent.service").Agent>;
    getAgent(id: string): Promise<import("./agent.service").Agent>;
    updateAgent(id: string, config: Partial<AgentConfig>): Promise<import("./agent.service").Agent>;
    deleteAgent(id: string): Promise<{
        success: boolean;
    }>;
    listAgents(): Promise<import("./agent.service").Agent[]>;
}
