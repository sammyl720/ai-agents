import type {
	ITool,
	MessageToolCall,
	MessageToolCompletion,
	FunctionDefinition,
} from '@definitions';
import { ToolGroup } from '../../../tools/custom/tool-group.js';
import { z } from 'zod';
import { GoogleSearchApi } from '../../../apis/google-search/index.js';

// Define the input parameters for the search tool using zod.
const googleSearchParser = z.object({
	query: z.string().min(1, 'Query must not be empty'),
	numResults: z.number().min(1).max(10).optional(),
});

export class GoogleSearchTools extends ToolGroup {
	constructor(
		private googleSearchApi: GoogleSearchApi,
		private isGlobal = false,
	) {
		super();
		this.initialize();
	}

	private toolDefinitions: FunctionDefinition[] = [
		{
			name: 'google_search',
			description: 'Perform a Google search and return top results.',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'The search query to find on Google.',
					},
					numResults: {
						type: 'number',
						description: 'The number of results to return (1-10).',
					},
				},
				required: ['query'],
				additionalProperties: false,
			},
		},
	];

	private async handleRequest(
		request: MessageToolCall,
	): Promise<MessageToolCompletion> {
		const {
			function: { name, arguments: args },
			id,
		} = request;
		const inputs = JSON.parse(args);

		const response: MessageToolCompletion = {
			role: 'tool',
			tool_call_id: id,
			content: JSON.stringify({ message: `No tool matching ${name}.` }),
		};

		try {
			switch (name) {
				case 'google_search': {
					const { query, numResults } = googleSearchParser.parse(inputs);
					const results = await this.googleSearchApi.search(query, numResults);
					response.content = JSON.stringify({
						message: `Search completed successfully.`,
						results,
					});
					break;
				}
				default:
					break;
			}
		} catch (error) {
			response.content = JSON.stringify({
				message: 'An error occurred during the search.',
				error: String(error),
			});
		}

		return response;
	}

	private initialize() {
		this.toolDefinitions.forEach((definition) =>
			this.addTool(
				definition,
				(request) => this.handleRequest(request),
				this.isGlobal,
			),
		);
	}
}
