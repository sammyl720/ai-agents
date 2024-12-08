import type {
	FunctionDefinition,
	ITool,
	MessageToolCall,
	MessageToolCompletion,
} from '@definitions';
import { ToolGroup } from '../tool-group.js';
import { FileAccessApi, type IFileAccessApi } from './file-access-api.js';
import { z } from 'zod';

const dirnameParser = z.object({ dirname: z.string() });
const readFileParser = z.object({ fileName: z.string() });
const saveImageParser = z.object({
	fileName: z.string(),
	imageUrl: z.string(),
});
const newFileContentParser = z.object({
	fileName: z.string(),
	content: z.string(),
});

export class FileAccessTools extends ToolGroup {
	constructor(
		private fileAccessApi: IFileAccessApi = new FileAccessApi('outputs'),
		private isGlobal = false,
	) {
		super();
		this.initialize();
	}

	private initialize() {
		this.toolDefinitions.forEach((definition) =>
			this.addFileAccessTool(definition),
		);
	}

	private toolDefinitions: FunctionDefinition[] = [
		{
			name: 'create_directory',
			description: 'Create a workspace directory',
			parameters: {
				type: 'object',
				properties: {
					dirname: {
						type: 'string',
						description: 'The name of the directory to create.',
					},
				},
				required: ['dirname'],
				additionalProperties: false,
			},
		},
		{
			name: 'list_directory_files',
			description: 'List the files of a workspace directory',
			parameters: {
				type: 'object',
				properties: {
					dirname: {
						type: 'string',
						description: 'The name of the directory to list.',
					},
				},
				required: ['dirname'],
				additionalProperties: false,
			},
		},
		{
			name: 'add_file',
			description: 'Add a file to a workspace directory',
			parameters: {
				type: 'object',
				properties: {
					fileName: {
						type: 'string',
						description: 'The name of the new file.',
					},
					content: {
						type: 'string',
						description: 'The content of the new file.',
					},
				},
				required: ['fileName', 'content'],
				additionalProperties: false,
			},
		},
		{
			name: 'update_file',
			description: 'Update a file in a workspace directory',
			parameters: {
				type: 'object',
				properties: {
					fileName: {
						type: 'string',
						description: 'The name of the file to update.',
					},
					content: {
						type: 'string',
						description:
							'The updated content of the file. It will override any existing content.',
					},
				},
				required: ['fileName', 'content'],
				additionalProperties: false,
			},
		},
		{
			name: 'get_file_content',
			description: 'Get the content of a file',
			parameters: {
				type: 'object',
				properties: {
					fileName: {
						type: 'string',
						description: 'The name of the file to read.',
					},
				},
				required: ['fileName'],
				additionalProperties: false,
			},
		},
		{
			name: 'delete_file',
			description: 'Delete a file',
			parameters: {
				type: 'object',
				properties: {
					fileName: {
						type: 'string',
						description: 'The name of the file to delete.',
					},
				},
				required: ['fileName'],
				additionalProperties: false,
			},
		},
		{
			name: 'save_image',
			description: 'Save an image from a url to file.',
			parameters: {
				type: 'object',
				properties: {
					fileName: {
						type: 'string',
						description: 'The target name of the image file.',
					},
					imageUrl: {
						type: 'string',
						description: 'The url to the image to save.',
					},
				},
				required: ['fileName', 'imageUrl'],
				additionalProperties: false,
			},
		},
	];

	private async handleRequest(
		request: MessageToolCall,
	): Promise<MessageToolCompletion> {
		const {
			function: { arguments: args, name },
			id,
		} = request;
		const inputs = JSON.parse(args);
		const response: MessageToolCompletion = {
			role: 'tool',
			tool_call_id: id,
			content: JSON.stringify({ message: `No Tool matching ${name}.` }),
		};

		try {
			switch (request.function.name) {
				case 'create_directory': {
					const { dirname } = dirnameParser.parse(inputs);
					const result = await this.fileAccessApi.createDirectory(dirname);
					const message = !!result
						? `Directory (${dirname}) created`
						: `Could not create ${dirname}`;
					response.content = JSON.stringify({ message });
					break;
				}
				case 'list_directory_files': {
					const { dirname } = dirnameParser.parse(inputs);
					const result = await this.fileAccessApi.listFiles(dirname);
					const message = !!result.length
						? `Directory (${dirname}) has ${result.length} items.`
						: `Directory ${dirname} is empty`;
					response.content = JSON.stringify({ message, result });
					break;
				}
				case 'add_file': {
					const { fileName, content } = newFileContentParser.parse(inputs);
					const result = await this.fileAccessApi.addFile(fileName, content);
					const message = !!result
						? `File ${fileName} added..`
						: `Could not add ${fileName}`;
					response.content = JSON.stringify({ message, result });
					break;
				}
				case 'update_file': {
					const { fileName, content } = newFileContentParser.parse(inputs);
					const result = await this.fileAccessApi.updateFile(fileName, content);
					const message = !!result
						? `File ${fileName} updated.`
						: `Could not update ${fileName}`;
					response.content = JSON.stringify({ message, result });
					break;
				}
				case 'get_file_content': {
					const { fileName } = readFileParser.parse(inputs);
					const result = await this.fileAccessApi.getFileContent(fileName);
					const message = !!result
						? `File ${fileName} retreived.`
						: `Could not retrieve ${fileName}`;
					response.content = JSON.stringify({ message, result });
					break;
				}
				case 'delete_file': {
					const { fileName } = readFileParser.parse(inputs);
					const result = await this.fileAccessApi.deleteFile(fileName);
					const message = !!result
						? `File ${fileName} deleted.`
						: `Could not delete ${fileName}`;
					response.content = JSON.stringify({ message });
					break;
				}
				case 'save_image': {
					const { fileName, imageUrl } = saveImageParser.parse(inputs);
					const result = await this.fileAccessApi.saveImage(imageUrl, fileName);
					const message = !!result
						? `Image saved to ${fileName}.`
						: `Could not save ${fileName}`;
					response.content = JSON.stringify({ message });
					break;
				}
			}
		} catch (error) {
			response.content = JSON.stringify(error);
		}

		return response;
	}

	private addFileAccessTool(definition: FunctionDefinition) {
		this.addTool(
			definition,
			(request) => this.handleRequest(request),
			this.isGlobal,
		);
	}
}
