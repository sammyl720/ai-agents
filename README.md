# @sammyl720/ai-agents

**AI Agents** is a TypeScript library that extends the capabilities of [OpenAI’s Node.js API](https://github.com/openai/openai-node) by creating and orchestrating multiple agents (with their own "tools") working together to achieve a given goal.

## Features

1. **Intuitive Agent Builder**: Easily construct agents with custom names, descriptions, and capabilities.
2. **Predefined & Customizable Tools**: Leverage built-in tools or build your own to provide agents with specialized capabilities.
3. **Agent Orchestration**: Coordinate multiple agents and their tools to accomplish complex tasks.
4. **Logging & Observability**: Add optional logging to track agent messages and orchestrator updates.

## Installation

**Prerequisites**:

- **Node.js**: Ensure you have Node.js **v22.2.0 or higher** installed.

**Install the Package**:

```bash
npm install @sammyl720/ai-agents
```

## Quick Start Example

Below is a minimal example showing how to create two agents—a writer and a historian—and orchestrate them to solve a prompt.

```typescript
import {
	AgentBuilderFactory,
	CompletionResult,
	IOrchestrator,
	ORCHESTRATOR_COMPLETED_EVENT,
	OrchestratorBuilder,
} from '@sammyl720/ai-agents';
import OpenAI from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Create agents
const agentFactory = new AgentBuilderFactory(openai);
const writer = agentFactory
	.getBuilder()
	.setName('Writer Agent')
	.setDescription('A clever writer that can write engaging stories.')
	.build();

const historian = agentFactory
	.getBuilder()
	.setName('Historian Agent')
	.setDescription('A historian with a vast knowledge base.')
	.build();

// Create orchestrator and add agents
const orchestrator: IOrchestrator = new OrchestratorBuilder()
	.setOpenAIClient(openai)
	.addAgent(writer)
	.addAgent(historian)
	.build();

// Listen for completion
orchestrator.on(ORCHESTRATOR_COMPLETED_EVENT, (result: CompletionResult) => {
	console.log(result.summary);
});

// Run a task
orchestrator.run(
	'Write a short story about why and how the Roman Empire fell.',
);
```

## Using Tools

Tools provide agents with enhanced capabilities. For example, you can enable file reading/writing, web searching, or any other custom function by integrating tools.

### Prebuilt Tools

**FileAccessTools**:  
Allows agents to read and write files in a designated `outputs` directory. Useful for scenarios like saving generated content for later use or record-keeping.

#### Adding a Prebuilt Tool to an Agent

```typescript
import { AgentBuilder, FileAccessTools } from '@sammyl720/ai-agents';
import OpenAI from 'openai';

const openai = new OpenAI();
const fileAccessTools = new FileAccessTools(); // Interacts with `outputs` directory

const writerAgent = new AgentBuilder()
	.addOpenAIClient(openai)
	.addTools(fileAccessTools) // Add file access capabilities
	.setName('Blog writer')
	.setDescription('Writes a blog on how to utilize AI and saves it to a file.')
	.build();
```

### Creating Your Own Tool

You can define custom tools by providing a function specification and a corresponding request handler. For details, see the [OpenAI Function Calling documentation](https://platform.openai.com/docs/guides/function-calling).

**Example:**

```typescript
import {
	AgentBuilder,
	MessageToolCall,
	ToolBuilder,
} from '@sammyl720/ai-agents';

// A fake web search API
const fakeSearchApi = (query: string) => `Processing query: ${query}...`;

const searchTool = new ToolBuilder()
	.setToolDefinition({
		type: 'function',
		function: {
			name: 'search_web',
			description: 'Search the web for a given query',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'What to search for.',
					},
				},
				required: ['query'],
				additionalProperties: false,
			},
		},
	})
	.setToolRequestHandler(async (request: MessageToolCall) => {
		const {
			id,
			function: { arguments: parameters },
		} = request;
		const { query } = JSON.parse(parameters) as { query: string };

		return {
			tool_call_id: id,
			role: 'tool',
			content: fakeSearchApi(query),
		};
	})
	// .setIsGlobal(true) // Uncomment to make this tool available to all agents
	.build();

const webSurferAgent = new AgentBuilder()
	.setName('Web Surfer')
	.setDescription('Searches the web for interesting content.')
	.addTool(searchTool)
	.build();
```

## Orchestration with File Access Tool Example

Below is a more complex example. Two agents (a "Reviewer" and a "Storyteller") cooperate under an Orchestrator. The Orchestrator and Agents use `FileAccessTools` to log and store the generated content. Logging is enabled to observe the conversation’s progression.

```typescript
import {
	AgentBuilderFactory,
	CompletionResult,
	FileAccessTools,
	IOrchestrator,
	JSONLinesFileLogger,
	ORCHESTRATOR_COMPLETED_EVENT,
	ORCHESTRATOR_UPDATE_EVENT,
	OrchestratorBuilder,
} from '@sammyl720/ai-agents';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const factory = new AgentBuilderFactory(openai);

const reviewer = factory
	.getBuilder()
	.setName('Analytical Reviewer')
	.setDescription(
		'Provides feedback on feasibility and logical validity of stories.',
	)
	.setAgentMessageLogger(new JSONLinesFileLogger('reviewer.jsonl', 'logs')) // Log messages
	.build();

const storyteller = factory
	.getBuilder()
	.setName('Story Teller')
	.setDescription('Crafts brilliant, joyful, and positive stories.')
	.setAgentMessageLogger(new JSONLinesFileLogger('storyteller.jsonl', 'logs')) // Log messages
	.build();

const orchestrator: IOrchestrator = new OrchestratorBuilder()
	.setOpenAIClient(openai)
	.addAgent(reviewer)
	.addAgent(storyteller)
	.addTools(new FileAccessTools()) // Enable file access
	.setMessageLogger(new JSONLinesFileLogger('orchestrator-log.jsonl', 'logs')) // Orchestrator logging
	.build();

orchestrator.on(ORCHESTRATOR_UPDATE_EVENT, (update) => {
	console.log(update);
});

orchestrator.on(
	ORCHESTRATOR_COMPLETED_EVENT,
	async (result: CompletionResult) => {
		console.log(result.summary);
		console.log('DONE');
	},
);

orchestrator.run(
	'Craft an engaging story about learning to program and save it to a markdown file.',
);
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues](https://github.com/sammyl720/ai-agents/issues) page.

## License

This project is licensed under the [MIT License](./LICENSE).
