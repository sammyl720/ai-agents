import { promises as fs } from 'fs';
import { join, isAbsolute } from 'path';

export class FileAccessApi implements IFileAccessApi {
	constructor(private basePath: string = process.cwd()) {
		// Ensure basePath is absolute
		if (!isAbsolute(this.basePath)) {
			this.basePath = join(process.cwd(), this.basePath);
		}
	}

	async createDirectory(dirname: string): Promise<boolean> {
		const dirPath = join(this.basePath, dirname);
		try {
			await fs.mkdir(dirPath, { recursive: true });
			return true;
		} catch {
			return false;
		}
	}

	async listFiles(dirname: string): Promise<string[]> {
		const dirPath = join(this.basePath, dirname);
		try {
			const files = await fs.readdir(dirPath);
			return files;
		} catch {
			return [];
		}
	}

	async addFile(fileName: string, content: string): Promise<boolean> {
		const filePath = join(this.basePath, fileName);
		try {
			// Check if file exists
			await fs.access(filePath);
			// If we can access it, it exists
			return false;
		} catch {
			// File does not exist, proceed
		}

		try {
			await fs.writeFile(filePath, content, { flag: 'wx' }); // 'wx' ensures fail if file exists
			return true;
		} catch {
			return false;
		}
	}

	async updateFile(fileName: string, updatedContent: string): Promise<boolean> {
		const filePath = join(this.basePath, fileName);
		try {
			// Check if file exists
			await fs.access(filePath);
			// File exists, now update
			await fs.writeFile(filePath, updatedContent, { flag: 'w' });
			return true;
		} catch {
			return false;
		}
	}

	async getFileContent(fileName: string): Promise<boolean> {
		const filePath = join(this.basePath, fileName);
		try {
			await fs.readFile(filePath, 'utf8');
			return true;
		} catch {
			return false;
		}
	}

	async deleteFile(fileName: string): Promise<boolean> {
		const filePath = join(this.basePath, fileName);
		try {
			await fs.unlink(filePath);
			return true;
		} catch {
			return false;
		}
	}

	async saveImage(imageUrl: string, fileName: string): Promise<boolean> {
		const filePath = join(this.basePath, fileName);

		try {
			const response = await fetch(imageUrl);
			if (!response.ok) {
				return false;
			}

			const buffer = await response.arrayBuffer();
			await fs.writeFile(filePath, new Uint8Array(buffer));
			return true;
		} catch {
			return false;
		}
	}
}

export interface IFileAccessApi {
	createDirectory(dirname: string): Promise<boolean>;
	listFiles(dirname: string): Promise<string[]>;
	addFile(fileName: string, content: string): Promise<boolean>;
	updateFile(fileName: string, updatedContent: string): Promise<boolean>;
	getFileContent(fileName: string): Promise<boolean>;
	deleteFile(fileName: string): Promise<boolean>;
	saveImage(imageUrl: string, fileName: string): Promise<boolean>;
}
