import { Agent } from '@agent';
import { DEFAULT_OPENAI_MODEL } from '@consts';
import type {
	AgentInitConfig,
	AI,
	IBuilder,
	ITool,
	IAgent,
	ILogger,
} from '@definitions';
import { NoOpLogger } from '@loggers';
import { MessageHandler } from '@message-handler';
import { AgentInitConfiguration } from '@parsers';

export class AgentBuilder implements IBuilder<IAgent> {
	private name: AgentInitConfig['name'] = '';
	private description: AgentInitConfig['description'] = '';
	private model?: string;
	private tools: ITool[] = [];
	private openAI: AI | null = null;
	private agentMessageLogger: ILogger = new NoOpLogger();

	build(): Agent {
		const config = AgentInitConfiguration.parse(this.config);
		if (this.openAI === null) {
			throw new Error(
				`Please pass in your OPENAI client first to the  AgentBuilder.addOpenAIClient(client) method.`,
			);
		}
		const messageHandler = new MessageHandler(this.agentMessageLogger);
		return new Agent(config, messageHandler, this.tools);
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

	addOpenAIClient(openAI: AI) {
		this.openAI = openAI;
		return this;
	}

	setAgentMessageLogger(logger: ILogger) {
		this.agentMessageLogger = logger;
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
