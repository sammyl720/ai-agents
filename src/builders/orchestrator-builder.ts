import type {
	AI,
	IAgent,
	ILogger,
	IOrchestrationStrategy,
	ITool,
} from '@definitions';
import { Orchestrator } from '../orchestrator/orchestrator.js';
import { ProjectStrategy } from '../orchestration-strategies/project-strategy.js';
import { NoOpLogger } from '../loggers/no-op-logger.js';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';

export class OrchestratorBuilder {
	private openAI: AI | null = null;
	private agents: IAgent[] = [];
	private strategy: IOrchestrationStrategy = new ProjectStrategy();
	private tools: ITool[] = [];
	private messageLogger: ILogger = new NoOpLogger();
	private model = DEFAULT_OPENAI_MODEL;

	build() {
		if (this.openAI === null) {
			throw new Error(
				`Please pass in your OPENAI client first to the  AgentBuilder.setOpenAIClient(client) method.`,
			);
		} else if (this.agents.length === 0) {
			throw new Error(
				`Please add atleast one agent before building orchestrator.`,
			);
		}

		return new Orchestrator(
			this.openAI,
			this.agents,
			this.tools,
			this.strategy,
			this.messageLogger,
			this.model,
		);
	}

	isBuildable() {
		return this.openAI !== null && this.agents.length > 0;
	}

	setStrategy(strategy: IOrchestrationStrategy) {
		this.strategy = strategy;
		return this;
	}

	addTool(tool: ITool) {
		if (!tool.isIncluded(this.tools)) {
			this.tools.push(tool);
		}
		return this;
	}

	addTools(tools: Iterable<ITool>) {
		for (const tool of tools) {
			this.addTool(tool);
		}
		return this;
	}

	setOpenAIClient(openAI: AI) {
		this.openAI = openAI;
		return this;
	}

	addAgent(agent: IAgent) {
		this.agents.push(agent);
		return this;
	}

	addAgents(agents: Iterable<IAgent>) {
		for (const agent of agents) {
			this.addAgent(agent);
		}

		return this;
	}

	setModel(model: string) {
		this.model = model;
		return this;
	}

	setMessageLogger(logger: ILogger) {
		this.messageLogger = logger;
		return this;
	}
}
