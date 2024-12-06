import { ToolBuilder } from '../builders/tool-builder.js';
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
