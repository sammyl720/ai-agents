import { z } from 'zod';
import {
	isTaskSnapshot,
	type IAgent,
	type IOrchestrator,
	type ITool,
	type MessageToolCall,
	type MessageToolCompletion,
	type TaskSnapshot,
} from '../types.js';
import type { ChatCompletionTool } from 'openai/resources/index.mjs';
import { MessageHandler } from '../message-handler/message-handler.js';
import type { IMessageRunner } from '../message-runner/message-runner.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';

export const AgentInitConfiguration = z.object({
	name: z.string().regex(new RegExp('^[a-zA-Z0-9_- ]{5,25}$')),
	description: z.string().min(20).max(500),
	model: z.string().default(DEFAULT_OPENAI_MODEL),
});

export type AgentInitConfig = {
	/** Name of agent. Name must be alphanumeric and between 5 and 25  characters long. */
	name: string;
	/** Details about what the agent purpose is and what it can do. Must be between 20 and 500 characters long. */
	description: string;
	/** Openai model to use. */
	model?: string;
};

export class Agent implements IAgent {
	readonly name!: string;
	readonly description!: string;
	readonly IsGlobal = false;

	private readonly model = DEFAULT_OPENAI_MODEL;
	private messageHandler = new MessageHandler();
	private allTools: ITool[] = [];

	get definition() {
		return this.agentDefinition;
	}

	get toolName() {
		const agentName = this.name.replace(/ /g, '_');
		return `assign_task_to_${agentName}`;
	}

	constructor(
		private messageRunner: IMessageRunner,
		configuration: AgentInitConfig,
		private tools: ITool[] = [],
	) {
		this.allTools = [...tools];
		const config = AgentInitConfiguration.parse(configuration);
		this.name = config.name;
		this.description = config.description;
	}

	initialize(orchestrator: IOrchestrator) {
		this.messageHandler = new MessageHandler();
		this.messageHandler.addMessage({
			role: 'system',
			content: this.getSystemPrompt(orchestrator),
		});
	}

	addGlobalTool(tool: ITool) {
		const isToolRegistered = this.allTools.some(t => t.definition.function.name)
		if (this.isToolRegistered(tool))
		{
			return;
		}

		this.allTools.push(tool);
	}

	canHandleRequest(request: MessageToolCall): boolean {
		return request.function.name === this.toolName;
	}

	async handleRequest(
		request: MessageToolCall,
	): Promise<MessageToolCompletion> {
		const payload = JSON.parse(request.function.arguments);
		const response: MessageToolCompletion = {
			role: 'tool',
			tool_call_id: request.id,
			content: '',
		};

		if (!this.canHandleRequest(request) || !isTaskSnapshot(payload)) {
			response.content = `{ "error": "Tool name or payload is invalid" }`;
			return response;
		}
		this.addTaskMessage(payload);
		const newMessage = await this.messageRunner.run(
			this.messageHandler,
			this.tools,
		);
		response.content = newMessage?.content?.toString() ?? 'No response';
		return response;
	}

	getGlobalTools(): ITool[] {
		return this.tools.filter(tool => tool.IsGlobal);
	}

	addTaskMessage(task: TaskSnapshot) {
		const messageContent = `Complete the following task:
        Task Id: ${task.id}
        Task Description: ${task.description}\n
        Additional Context: ${task.additionalContext ?? 'None'}`;
		this.messageHandler.addMessage({
			role: 'system',
			content: messageContent,
		});
	}

	private isToolRegistered(tool: ITool) {
		const toolName = tool.definition.function.name;
		if (toolName === this.toolName)
		{
			return true;
		}

		return this.allTools.some(t => t.toolName === toolName);
	}

	private get agentDefinition(): ChatCompletionTool {
		return {
			type: 'function',
			function: {
				name: this.toolName,
				description: `Assign task to agent (${this.name})`,
				parameters: {
					type: 'object',
					properties: {
						description: {
							type: 'string',
							description:
								'The description of the task that should be completed',
						},
						additionalContext: {
							type: 'string',
							description:
								'A string with valid json to provide any additional context that could be useful.',
						},
						id: {
							type: 'string',
							description: 'The id associated with this task.',
						},
					},
					additionalProperties: false,
					required: ['description', 'id'],
				},
			},
		};
	}

	private getSystemPrompt(orchestrator: IOrchestrator) {
		const instructions = orchestrator.Instructions;
		return `## You are an agent working within a team to complete a given goal.
        
        ### The following designations have been assigned to you: ${this.AgentDetails}

        You be assigned tasks that are suited for you given your designation.

        ### Agent's on your team
        ${orchestrator.getAgentsDetails()}
        
        ### Your team has been given the following goal:
        ${orchestrator.Instructions}
        `;
	}

	AgentDetails = `
    **Title**: ${this.name}
    **Description**: ${this.description!}
    `;
}
