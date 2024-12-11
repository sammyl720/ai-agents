import { ToolBuilder } from '@builders';
import { z } from 'zod';
import type {
	IAgent,
	IOrchestrationStrategy,
	IOrchestrator,
	ITool,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';
import { ProjectCompletionParser, ProjectUpdateParser } from '@parsers';

export class ProjectStrategy implements IOrchestrationStrategy {
	getAgentPrompt(orchestrator: IOrchestrator, agent: IAgent): string {
		const prompt = `
## Role: You are a specialized agent in a multi-agent team, each working together toward a shared goal.

### Your Role:
${agent.AgentDetails}

### Your Mission:
- Follow the team leader’s instructions.
- Collaborate with other team members as needed.
- Contribute specialized knowledge or skills aligned with your role.

### Other Team Members:
${orchestrator.getAgentsDetails()}

### Overall Project Instructions:
${orchestrator.Instructions}
`;

		return prompt;
	}

	getSystemPrompt(orchestrator: IOrchestrator) {
		const prompt = `
## Role: Project Lead Orchestrator

You manage a team of agents working toward the following goal:
${orchestrator.Instructions}

### Your Responsibilities:
1. Break down the goal into manageable tasks.
2. Assign tasks to the most suitable agents.
3. Continue until the goal is achieved or deemed unachievable.

### Team Members:
${orchestrator.getAgentsDetails()}

### Tools Available:
- You can delegate tasks to agents using the provided tools.
- Use the 'provide_update_to_all_agents' function to broadcast status updates.
- Use 'complete_project' once the final goal is reached.

Remember: Keep all communication relevant, focused, and goal-oriented.
`;
		return prompt;
	}

	getOrchestratorTools(orchestrator: IOrchestrator): Iterable<ITool> {
		return [
			this.getUpdateAllAgentsTool(orchestrator),
			this.getOnCompleteTool(orchestrator),
		];
	}

	private getUpdateAllAgentsTool(orchestrator: IOrchestrator): ITool {
		const toolBuilder = new ToolBuilder();

		toolBuilder.setToolDefinition({
			type: 'function',
			function: {
				name: 'provide_update_to_all_agents',
				description:
					'Broadcast an update message to all agents currently participating in the project.',
				parameters: {
					type: 'object',
					properties: {
						updateMessage: {
							type: 'string',
							description:
								'A message containing the current status, progress, or changes that should be communicated to all agents.',
						},
					},
					additionalProperties: false,
					required: ['updateMessage'],
				},
			},
		});

		toolBuilder.setToolRequestHandler((request: MessageToolCall) => {
			const {
				function: { arguments: result },
				id,
			} = request;
			const response: MessageToolCompletion = {
				tool_call_id: id,
				role: 'tool',
				content: 'Message broadcasted.',
			};

			try {
				const completion = ProjectUpdateParser.parse(JSON.parse(result));
				orchestrator.notifyAllAgents(completion);
				return response;
			} catch (error) {
				response.content = JSON.stringify(error);
				return response;
			}
		});
		return toolBuilder.build();
	}

	private getOnCompleteTool(orchestrator: IOrchestrator): ITool {
		const toolBuilder = new ToolBuilder();

		toolBuilder.setToolDefinition({
			type: 'function',
			function: {
				name: 'complete_project',
				description: 'Complete project with final result',
				parameters: {
					type: 'object',
					properties: {
						summary: {
							type: 'string',
							description: 'A summary of the project and the results',
						},
						result: {
							type: 'string',
							description:
								"The project 'deliverable' as markdown. Include the details about what was achieved and all information revelant to the project goal.",
						},
						actionsTaken: {
							type: 'array',
							description:
								'A list of the action taken along with a summary of their results',
							items: {
								type: 'object',
								properties: {
									action: {
										type: 'string',
										description: 'Summary of the action taken',
									},
									result: {
										type: 'string',
										description: 'A summary of the result of the action.',
									},
								},
							},
						},
					},
					addititionalProperties: false,
					required: ['summary', 'result', 'actionTaken'],
				},
			},
		});

		toolBuilder.setToolRequestHandler((request: MessageToolCall) => {
			const {
				function: { arguments: result },
				id,
			} = request;
			const response: MessageToolCompletion = {
				tool_call_id: id,
				role: 'tool',
				content: 'Project result recorded. No new messages are needed.',
			};

			try {
				const completion = ProjectCompletionParser.parse(JSON.parse(result));
				orchestrator.setCompletionResult(completion);
				return response;
			} catch (error) {
				response.content = JSON.stringify(error);
				return response;
			}
		});
		return toolBuilder.build();
	}
}
