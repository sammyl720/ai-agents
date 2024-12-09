import type {
	FunctionDefinition,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';
import { ToolGroup } from '../tool-group.js';
import { AmazonApi } from '../../../apis/index.js';
import { z } from 'zod';

// Define input validation schemas using zod
const searchParser = z.object({
	query: z.string(),
	pageNumber: z.number().optional(),
});

const productDetailsParser = z.object({
	asin: z.string(),
});

const offersParser = z.object({
	asin: z.string(),
	condition: z.enum(['new', 'used', 'all']).optional(),
	minPrice: z.number().optional(),
	maxPrice: z.number().optional(),
	pageNumber: z.number().optional(),
});

export class AmazonTools extends ToolGroup {
	constructor(
		private amazonApi: AmazonApi,
		private affilated: string | null = null,
	) {
		super();
		this.initialize();
	}

	private toolDefinitions: FunctionDefinition[] = [
		{
			name: 'amazon_search_products',
			description: 'Search Amazon products by query.',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'The search keyword or phrase.',
					},
					pageNumber: {
						type: 'number',
						description: 'Page number for paginated results.',
						default: 1,
					},
				},
				required: ['query'],
				additionalProperties: false,
			},
		},
		{
			name: 'amazon_get_product_details',
			description: 'Get product details by ASIN.',
			parameters: {
				type: 'object',
				properties: {
					asin: {
						type: 'string',
						description: 'The Amazon Standard Identification Number (ASIN).',
					},
				},
				required: ['asin'],
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
			content: JSON.stringify({ message: `No tool matching ${name}` }),
		};

		try {
			switch (name) {
				case 'amazon_search_products': {
					const { query, pageNumber } = searchParser.parse(inputs);
					const result = await this.amazonApi.search(query, pageNumber);
					response.content = JSON.stringify({
						message: 'Search completed successfully.',
						result: result,
					});
					break;
				}
				case 'amazon_get_product_details': {
					const { asin } = productDetailsParser.parse(inputs);
					const result = await this.amazonApi.getProductDetails(asin);
					response.content = JSON.stringify({
						message: 'Product details retrieved successfully.',
						result,
					});
					break;
				}
				case 'get_Affilate_link': {
					const { asin } = productDetailsParser.parse(inputs);
					if (!this.affilated) {
						break;
					}
					const result = `http://www.amazon.com/dp/${asin}/ref=nosim?tag=${this.affilated}`;
					response.content = JSON.stringify({
						message: 'Product details retrieved successfully.',
						result,
					});
					break;
				}
				default:
					break;
			}
		} catch (error) {
			response.content = JSON.stringify({
				message: 'An error occurred.',
				error: String(error),
			});
		}

		return response;
	}

	private initialize() {
		if (!!this.affilated) {
			this.addAffilatedLinkTool();
		}
		this.toolDefinitions.forEach((definition) =>
			this.addTool(
				definition,
				(request) => this.handleRequest(request),
				false, // set to true if you'd like these tools to be available globally
			),
		);
	}
	addAffilatedLinkTool() {
		this.toolDefinitions.push({
			name: 'get_Affilate_link',
			description: 'Get product affiliate link',
			parameters: {
				type: 'object',
				properties: {
					asin: {
						type: 'string',
						description: 'The Amazon Standard Identification Number (ASIN).',
					},
				},
				required: ['asin'],
				additionalProperties: false,
			},
		});
	}
}
