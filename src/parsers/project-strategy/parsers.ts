import { z } from 'zod';

export const ProjectUpdateParser = z.object({
	updateMessage: z.string(),
});

export const ProjectCompletionParser = z.object({
	summary: z.string(),
	result: z.string(),
	actionsTaken: z.array(
		z.object({
			action: z.string(),
			result: z.string(),
		}),
	),
});
