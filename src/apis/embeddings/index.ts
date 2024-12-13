import type { AIEmbedding } from '@definitions';

export const DEFAULT_EMBEDDINGS_MODEL = 'text-embedding-3-small';

export class EmbeddingsAPI {
	constructor(
		private openai: AIEmbedding,
		private model = DEFAULT_EMBEDDINGS_MODEL,
	) {}

	// Get embedding for a single input
	async Get(input: string): Promise<number[]> {
		const response = await this.openai.embeddings.create({
			model: this.model,
			input,
		});

		return response.data[0]!.embedding;
	}

	// Compute cosine similarity between two embeddings
	static CosineSimilarity(embedding1: number[], embedding2: number[]): number {
		const dotProduct = embedding1.reduce(
			(sum, value, index) => sum + value * embedding2[index]!,
			0,
		);
		const magnitude1 = Math.sqrt(
			embedding1.reduce((sum, value) => sum + value * value, 0),
		);
		const magnitude2 = Math.sqrt(
			embedding2.reduce((sum, value) => sum + value * value, 0),
		);

		if (magnitude1 === 0 || magnitude2 === 0) {
			throw new Error(
				'One of the embeddings has zero magnitude, cannot compute similarity.',
			);
		}

		return dotProduct / (magnitude1 * magnitude2);
	}
}
