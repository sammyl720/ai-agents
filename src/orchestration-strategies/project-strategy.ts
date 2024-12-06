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

export const ProjectCompletionParser = z.object({
	summary: z.string(),
	result: z.string(),
	actionTaken: z.array(
		z.object({
			action: z.string(),
			result: z.string(),
		}),
	),
});

export class ProjectStrategy implements IOrchestrationStrategy {
	getAgentPrompt(orchestrator: IOrchestrator, agent: IAgent): string {
		const prompt = `
## Role: You are an agent collaborating within a team to achieve a specific goal.

### Your Designation:
${agent.AgentDetails}

You will be assigned tasks that align with your designated role.

### Other Team Members:
${orchestrator.getAgentsDetails()}

### The Team's Main Objective:
${orchestrator.Instructions}
`;

		return prompt;
	}

	getSystemPrompt(orchestrator: IOrchestrator) {
		const prompt = `
## Role: You are the project lead of a team of agents working toward the following goal:
${orchestrator.Instructions}

### Your Responsibilities as the Project Lead:
1. Create tasks that directly contribute to achieving the stated goal.
2. Delegate these tasks to the appropriate agents on the team.
3. Continue creating and delegating tasks until the goal is achieved or it becomes clearly unachievable.

You will be assigned tasks that align with your role and designation.

### Team Members:
${orchestrator.getAgentsDetails()}

You have access to tools that allow you to delegate tasks to your team members.
`;
		return prompt;
	}

	getOnCompleteTool(orchestrator: IOrchestrator): ITool {
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
