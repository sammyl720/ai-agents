import type {
	AI,
	IAgent,
	IOrchestrationStrategy,
	IOrchestrator,
	ITool,
} from '@definitions';
import { MessageHandler } from '@message-handler';
import { ProjectCompletionParser, ProjectUpdateParser } from '@parsers';
import { MessageRunner, type IMessageRunner } from '@message-runner';
import {
	AGENT_TASK_COMPLETED,
	AGENT_TASK_INPROGRESS,
	DEFAULT_OPENAI_MODEL,
	ORCHESTRATOR_COMPLETED_EVENT,
	ORCHESTRATOR_UPDATE_EVENT,
} from '../consts.js';
import EventEmitter from 'events';
import { ProjectStrategy } from '../orchestration-strategies/project-strategy.js';
import type { Task } from 'src/tasks/task.js';
import type { TypeOf } from 'zod';

export class Orchestrator extends EventEmitter implements IOrchestrator {
	private instructions = '';
	private messageHandler = new MessageHandler();
	private globalTools: ITool[] = [];
	private isRunning = false;
	private result: TypeOf<typeof ProjectCompletionParser> | null = null;
	private agentStartedListener = (update: Task) =>
		this.emit(AGENT_TASK_INPROGRESS, update);
	private agentCompletedListener = (update: Task) => {
		this.emit(AGENT_TASK_COMPLETED, update);
	};

	constructor(
		private openai: AI,
		private agents: IAgent[],
		private tools: ITool[] = [],
		public readonly strategy: IOrchestrationStrategy = new ProjectStrategy(),
	) {
		super();
		this.globalTools = this.tools.filter((tool) => tool.IsGlobal);
	}

	getAgentsDetails(): string {
		return this.agents.reduce((details, current) => {
			return `${details}${current}`;
		}, '');
	}

	getMessageRunner(): IMessageRunner {
		return new MessageRunner(this.openai, DEFAULT_OPENAI_MODEL);
	}

	get Instructions() {
		return this.instructions;
	}

	async run(instrucions: string) {
		this.instructions = instrucions;
		this.messageHandler = new MessageHandler();
		this.agents.forEach((agent) => {
			this.addGlobalTools(agent);
			agent.initialize(this);
			agent.on(AGENT_TASK_INPROGRESS, this.agentStartedListener);
			agent.on(AGENT_TASK_COMPLETED, this.agentCompletedListener);
		});

		this.registerGlobalToolsWithAgents();
		this.messageHandler.addMessage({
			role: 'system',
			content: this.strategy.getSystemPrompt(this),
		});

		const runner = new MessageRunner(this.openai, DEFAULT_OPENAI_MODEL);
		const tools = [
			...this.agents,
			...this.globalTools,
			...this.strategy.getOrchestratorTools(this),
		];

		this.isRunning = true;
		let currentMesage = await runner.run(this.messageHandler, tools);
		while (this.isRunning && currentMesage != null) {
			this.emit(ORCHESTRATOR_UPDATE_EVENT, currentMesage);
			this.messageHandler.addMessage(currentMesage);
			currentMesage = await runner.run(this.messageHandler, tools);
		}

		this.removeAgentListener();
		this.removeAllListeners();
		this.isRunning = false;

		return 0;
	}

	removeAgentListener() {
		this.agents.forEach((agent) => {
			agent.off(AGENT_TASK_INPROGRESS, this.agentStartedListener);
			agent.off(AGENT_TASK_COMPLETED, this.agentCompletedListener);
		});
	}

	setCompletionResult(result: TypeOf<typeof ProjectCompletionParser>) {
		this.isRunning = false;
		this.result = result;
		this.emit(ORCHESTRATOR_COMPLETED_EVENT, result);
	}

	notifyAllAgents(update: TypeOf<typeof ProjectUpdateParser>): void {
		for (const agent of this.agents) {
			agent.notify(update);
		}
	}

	private registerGlobalToolsWithAgents() {
		this.agents.forEach((agent) => {
			for (const tool of this.globalTools) {
				agent.addGlobalTool(tool);
			}
		});
	}

	private addGlobalTools(agent: IAgent) {
		const globalTools = agent
			.getGlobalTools()
			.filter((tool) => this.isGlobalToolRegistered(tool));
		this.globalTools = [...this.globalTools, ...globalTools];
	}

	private isGlobalToolRegistered(tool: ITool) {
		const toolName = tool.definition.function.name;
		return this.globalTools.some(
			(t) => t.definition.function.name === toolName,
		);
	}
}
