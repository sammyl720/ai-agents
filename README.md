**@sammyl720/ai-agents**

# AI Agents

This package enables extending the capabilities of [OpenAI](https://github.com/openai/openai-node) by creating agents that work together to achieve a given goal.

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

orchestrator.on(ORCHESTRATOR_UPDATE_EVENT, console.log);
orchestrator.on(
	ORCHESTRATOR_COMPLETED_EVENT,
	(completionResult: CompletionResult) => {
		console.log(completionResult.summary);
		// writeObjectToJsonFile(completionResult, "rome-empire-fall.json");
	},
);
orchestrator.run(
	'Write a short story about why and how the Roman Empire Fell.',
);
```
