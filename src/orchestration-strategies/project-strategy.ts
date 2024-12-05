import type {
	IAgent,
	IOrchestrationStrategy,
	IOrchestrator,
} from '../types.js';

export class ProjectStrategy implements IOrchestrationStrategy {
	getAgentPrompt(orchestrator: IOrchestrator, agent: IAgent): string {
		return `## You are an agent working within a team to complete a given goal.
        
        ### The following designations have been assigned to you: ${agent.AgentDetails}

        You be assigned tasks that are suited for you given your designation.

        ### Agent's on your team
        ${orchestrator.getAgentsDetails()}
        
        ### Your team has been given the following goal:
        ${orchestrator.Instructions}
        `;
	}

	getSystemPrompt(orchestrator: IOrchestrator) {
		return `## You are a project lead of a team of agents tasked to complete the following goal:
        ${orchestrator.Instructions}
        
        #### Your responsibility as the project lead is as follows:
        1. Create tasks aimed at achieving the aforementioned goal.
        2. Delegate (i.e hand of tasks) to agents on the team .
        3. Keep creating and delegating tasks until the goal is achieved or when, in the rear case, deemed unacheivable.

        You be assigned tasks that are suited for you given your designation.

        ### Agent's on your team
        ${orchestrator.getAgentsDetails()}
        
        You've be suppled with tools to hand of tasks to agent's on your team.`;
	}
}
