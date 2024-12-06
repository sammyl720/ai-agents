import { OpenAI } from 'openai';
import { Agent } from '@agent';
import { DEFAULT_OPENAI_MODEL } from '@consts';
import type { AgentInitConfig, IAgent, IBuilder, ITool } from '@definitions';
import { MessageRunner } from '@message-runner';
import { AgentInitConfiguration } from '@parsers';

export class AgentBuilder implements IBuilder<IAgent> {
	private name: AgentInitConfig['name'] = '';
	private description: AgentInitConfig['description'] = '';
	private model?: string;
	private tools: ITool[] = [];
	private openAI: OpenAI | null = null;

	build() {
		const config = AgentInitConfiguration.parse(this.config);
		if (this.openAI === null) {
			throw new Error(
				`Please pass in your OPENAI client first to the  AgentBuilder.addOpenAIClient(client) method.`,
			);
		}
		return new Agent(config, this.tools);
	}

	isBuildable() {
		return this.initConfig !== null && this.openAI !== null;
	}

	setName(name: AgentInitConfig['name']) {
		this.name = name;
		return this;
	}

	setDescription(description: AgentInitConfig['description']) {
		this.description = description;
		return this;
	}

	setOpenAIModel(model: string) {
		this.model = model;
		return this;
	}

	addTool(tool: ITool) {
		this.tools.push(tool);
		return this;
	}

	addTools(tools: Iterable<ITool>) {
		for (const tool of tools) {
			this.addTool(tool);
		}
		return this;
	}

	addOpenAIClient(openAI: OpenAI) {
		this.openAI = openAI;
		return this;
	}

	private get initConfig(): Required<AgentInitConfig> | null {
		const result = AgentInitConfiguration.safeParse(this.config);

		if (result.success) {
			return result.data;
		}

		return null;
	}

	private get config(): Required<AgentInitConfig> {
		return {
			name: this.name,
			description: this.description,
			model: this.model ?? DEFAULT_OPENAI_MODEL,
		};
	}
}
