import type {
	MessageToolCall,
	ToolDefinition,
	ToolRequestHandler,
} from '@definitions';
import { Tool } from '../../tool.js';
import { z } from 'zod';

// Define the input arguments using zod
const takeBreatherParser = z.object({
	milliseconds: z.number().min(1, 'Delay must be at least 1 millisecond'),
});

const takeBreatherDefinition: ToolDefinition = {
	type: 'function',
	function: {
		name: 'take_breather',
		description:
			'Wait for a specified number of milliseconds before returning, allowing the agent to slow down.',
		parameters: {
			type: 'object',
			properties: {
				milliseconds: {
					type: 'number',
					description: 'The time in milliseconds to wait before returning.',
				},
			},
			required: ['milliseconds'],
			additionalProperties: false,
		},
	},
};

const takeBreatherHandler: ToolRequestHandler = async (
	request: MessageToolCall,
) => {
	const {
		function: { arguments: args },
		id,
	} = request;
	const parsedArgs = JSON.parse(args);
	const { milliseconds } = takeBreatherParser.parse(parsedArgs);

	await new Promise((resolve) => setTimeout(resolve, milliseconds));

	return {
		role: 'tool',
		tool_call_id: id,
		content: JSON.stringify({
			message: `Breather completed after ${milliseconds}ms.`,
		}),
	};
};

export const TakeBreatherTool = new Tool(
	takeBreatherDefinition,
	takeBreatherHandler,
	true,
);
