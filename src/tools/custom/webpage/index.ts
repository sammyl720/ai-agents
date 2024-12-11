import { ToolGroup } from '../tool-group.js';
import { WebpageApi } from '../../../apis/webpage/index.js';
import { z } from 'zod';
import type {
	FunctionDefinition,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';

// Define the input parser for the tool using zod
const getWebpageParser = z.object({
	url: z.string().url('Must be a valid URL starting with http or https'),
});

export class WebpageTools extends ToolGroup {
	constructor(
		private webpageApi: WebpageApi,
		private isGlobal = false,
	) {
		super();
		this.initialize();
	}

	private toolDefinitions: FunctionDefinition[] = [
		{
			name: 'get_webpage',
			description: 'Retrieve the HTML content of a webpage from the given URL.',
			parameters: {
				type: 'object',
				properties: {
					url: {
						type: 'string',
						description: 'A fully qualified URL of the webpage to fetch.',
					},
				},
				required: ['url'],
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

		const response: MessageToolCompletion = {
			role: 'tool',
			tool_call_id: id,
			content: JSON.stringify({ message: `No tool matching ${name}.` }),
		};

		try {
			switch (name) {
				case 'get_webpage': {
					const { url } = getWebpageParser.parse(JSON.parse(args));
					const htmlContent = await this.webpageApi.getWebpageContent(url);
					response.content = JSON.stringify({
						message: 'Page fetched successfully.',
						content: htmlContent,
					});
					break;
				}
				default:
					break;
			}
		} catch (error) {
			response.content = JSON.stringify({
				message: 'An error occurred while fetching the webpage.',
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
