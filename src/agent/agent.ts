import EventEmitter from 'events';
import {
	isTaskSnapshot,
	type AgentInitConfig,
	type IAgent,
	type IMessageRunner,
	type IOrchestrator,
	type ITool,
	type MessageToolCall,
	type MessageToolCompletion,
	type TaskSnapshot,
} from '@definitions';
import { OpenAI } from 'openai';
import { MessageHandler } from '@message-handler';
import {
	AGENT_TASK_INPROGRESS,
	AGENT_TASK_COMPLETED,
	DEFAULT_OPENAI_MODEL,
} from '@consts';
import { AgentInitConfiguration, ProjectUpdateParser } from '@parsers';
import { Task } from '../tasks/task.js';
import type { TypeOf } from 'zod';

export class Agent extends EventEmitter implements IAgent {
	readonly name!: string;
	readonly description!: string;
	readonly IsGlobal = false;

	private readonly model = DEFAULT_OPENAI_MODEL;
	private messageHandler = new MessageHandler();
	private allTools: ITool[] = [];
	private currentTask: Task | null = null;
	private messageRunner: IMessageRunner | null = null;

	get definition() {
		return this.agentDefinition;
	}

	get toolName() {
		const agentName = this.name.replace(/ /g, '_');
		return `assign_task_to_${agentName}`;
	}

	constructor(
		configuration: AgentInitConfig,
		private tools: ITool[] = [],
	) {
		super();
		this.allTools = [...tools];
		const config = AgentInitConfiguration.parse(configuration);
		this.name = config.name;
		this.description = config.description;
	}

	initialize(orchestrator: IOrchestrator) {
		this.messageHandler = new MessageHandler();
		this.messageRunner = orchestrator.getMessageRunner();
		this.messageHandler.addMessage({
			role: 'system',
			content: orchestrator.strategy.getAgentPrompt(orchestrator, this),
		});
	}

	addGlobalTool(tool: ITool) {
		const isToolRegistered = this.allTools.some(
			(t) => t.definition.function.name,
		);
		if (this.isToolRegistered(tool)) {
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
		} else if (this.messageRunner === null) {
			this.currentTask?.abort('No MessageRunner supplied');
			this.emit(AGENT_TASK_COMPLETED, this.currentTask);
			response.content = `{ "error": "Agent is not available." }`;
			return response;
		}

		this.addTaskMessage(payload);

		const newMessage = await this.messageRunner.run(
			this.messageHandler,
			this.tools,
		);
		response.content = newMessage?.content?.toString() ?? 'No response';
		this.currentTask?.complete(response.content);
		if (!!newMessage?.content) {
			this.emit(AGENT_TASK_COMPLETED, this.currentTask);
		}
		return response;
	}

	notify(update: TypeOf<typeof ProjectUpdateParser>): void {
		this.messageHandler.addMessage({
			role: 'system',
			content: update.updateMessage,
		});
	}

	isIncluded(tools: ITool[]): boolean {
		return tools.some((t) => this.toolName === t.toolName);
	}

	getGlobalTools(): ITool[] {
		return this.tools.filter((tool) => tool.IsGlobal);
	}

	addTaskMessage(taskSnapshot: TaskSnapshot) {
		this.currentTask = this.assignTask(taskSnapshot);

		const messageContent = `Complete the following task:
        Task Id: ${this.currentTask.id}
        Task Description: ${this.currentTask.description}\n
        Additional Context: ${this.currentTask.additionalContext ?? 'None'}`;
		this.messageHandler.addMessage({
			role: 'system',
			content: messageContent,
		});

		this.emit(AGENT_TASK_INPROGRESS, this.currentTask);
	}

	private assignTask({ description, additionalContext }: TaskSnapshot) {
		const task = new Task(description, additionalContext);
		return task.assign(this);
	}

	private isToolRegistered(tool: ITool) {
		const toolName = tool.definition.function.name;
		if (toolName === this.toolName) {
			return true;
		}

		return this.allTools.some((t) => t.toolName === toolName);
	}

	private get agentDefinition(): OpenAI.Chat.Completions.ChatCompletionTool {
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
					},
					additionalProperties: false,
					required: ['description', 'id'],
				},
			},
		};
	}

	AgentDetails = `
    **Title**: ${this.name}
    **Description**: ${this.description!}
    `;
}
