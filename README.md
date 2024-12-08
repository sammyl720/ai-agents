**@sammyl720/ai-agents**

# AI Agents

This package enables extending the capabilities of [OpenAI](https://github.com/openai/openai-node) by creating agents with tools that work together to achieve a given goal.

### Features

1. Intuitive Agents Builder
2. Predefined Tools
3. Intuitive Tools Builder
4. Agent Orchestration

## Installation

Make sure you have [NodeJS](https://nodejs.org/en) version _v22.2.0_ or higher installed.

**Install Package**

```bash
npm install @sammyl720/ai-agents
```

## Usage

**Quick Start**

```typescript
import {
	AgentBuilderFactory,
	CompletionResult,
	IOrchestrator,
	ORCHESTRATOR_COMPLETED_EVENT,
	ORCHESTRATOR_UPDATE_EVENT,
	OrchestratorBuilder,
} from '@sammyl720/ai-agents';
import OpenAI from 'openai';

// Initiated openai instance with your api key
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const agentBuilderFactory = new AgentBuilderFactory(openai);
const writer = agentBuilderFactory
	.getBuilder()
	.setName('Writer Agent')
	.setDescription('A clever writer that can write engaging stories.')
	.build();

const historian = agentBuilderFactory
	.getBuilder()
	.setName('Historian Agent')
	.setDescription('A historian with a vase knowdledge base.')
	.build();

const orchestrator: IOrchestrator = new OrchestratorBuilder()
	.setOpenAIClient(openai)
	.addAgent(writer)
	.addAgent(historian)
	.build();

orchestrator.on(
	ORCHESTRATOR_COMPLETED_EVENT,
	(completionResult: CompletionResult) => {
		console.log(completionResult.summary);
	},
);
orchestrator.run(
	'Write a short story about why and how the Roman Empire Fell.',
);
```

## Using tools

The agents and orchestrator can be supplied with tools that give them extra capabilites. You can use one of the custom prebuilt tools or create your own.

### Providing prebuilt tool to agent

```typescript
import { AgentBuilder, FileAccessTools } from '@sammyl720/ai-agents';
import OpenAI from 'openai';

const openai = new OpenAI();

// tools that will access an `outputs` directory in the current working directory.
const fileAccessTools = new FileAccessTools();

// create an agent with file access
const writerAgent = new AgentBuilder()
	.addOpenAIClient(openai)
	.addTools(fileAccessTools)
	.setName('Blog writer')
	.setDescription(
		'Write a blog about how to utilitize AI. Save the blog to file.',
	)
	.build();
```

#### Creating your own tool

Check out the OpenAI [documentation](https://platform.openai.com/docs/guides/function-calling) on defining and handling tools.

```typescript
import {
	AgentBuilder,
	MessageToolCall,
	ToolBuilder,
} from '@sammyl720/ai-agents';

const fakeSearchApi = (query: string) => `Proccessing query ${query}...`;
const searchTool = new ToolBuilder()
	.setToolDefinition({
		type: 'function',
		function: {
			name: 'search_web',
			description: 'Search the web for given query',
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
		// unpack request
		const {
			id,
			function: { arguments: parameters },
		} = request;
		// parse arguments
		const { query } = JSON.parse(parameters) as { query: string };
		return {
			tool_call_id: id,
			role: 'tool',
			content: fakeSearchApi(query),
		};
	})
	// .setIsGlobal(true) // <- Make tool shared with all agents
	.build();

const agent = new AgentBuilder()
	.setName('Web surfer')
	.setDescription('Searches the web form interesting content.')
	.addTool(searchTool)
	.build();
```

## Orchestration with file access tool example

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

// Initiated openai instance with your api key
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const agentBuilderFactory = new AgentBuilderFactory(openai);
const succinct = agentBuilderFactory
	.getBuilder()
	.setName('Analytical Reviewer')
	.setAgentMessageLogger(new JSONLinesFileLogger('reviewer.jsonl', 'logs')) // <- adds logger to record agent messages
	.setDescription(
		'A down to earth story reviewer who provides feedback regarding the feasibility and logical validity of proposed stories.',
	)
	.build();

const storyTeller = agentBuilderFactory
	.getBuilder()
	.setName('Story teller')
	.setAgentMessageLogger(new JSONLinesFileLogger('storyteller.jsonl', 'logs')) // <- adds logger to record agent messages
	.setDescription(
		'A brilliant storyteller with a joyful and positive disposition.',
	)
	.build();

const orchestrator: IOrchestrator = new OrchestratorBuilder()
	.setOpenAIClient(openai)
	.addAgent(succinct)
	.addAgent(storyTeller)
	.addTools(new FileAccessTools()) // <- Adding file access tools
	.setMessageLogger(new JSONLinesFileLogger('orchestrator-log.jsonl', 'logs')) // <- adds logger to record agent messages
	.build();

orchestrator.on(ORCHESTRATOR_UPDATE_EVENT, (update) => {
	console.log(update);
});

orchestrator.on(
	ORCHESTRATOR_COMPLETED_EVENT,
	async (completionResult: CompletionResult) => {
		console.log(completionResult.summary);
		console.log('DONE');
	},
);
orchestrator.run(
	'Craft an engaging story about learning to program and save it to a markdown file.',
);
```
