import { OpenAI } from 'openai';
import type {
	IAgent,
	IBuilder,
	IOrchestrationStrategy,
	IOrchestrator,
	ITool,
} from '@definitions';
import { Orchestrator } from '../orchestrator/orchestrator.js';
import { ProjectStrategy } from '../orchestration-strategies/project-strategy.js';

export class OrchestratorBuilder implements IBuilder<IOrchestrator> {
	private openAI: OpenAI | null = null;
	private agents: IAgent[] = [];
	private strategy: IOrchestrationStrategy = new ProjectStrategy();
	private tools: ITool[] = [];

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

	setOpenAIClient(openAI: OpenAI) {
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
}
