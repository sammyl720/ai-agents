import { z } from 'zod';
import { DEFAULT_OPENAI_MODEL } from '../consts.js';

const nameRegex = new RegExp('^[a-zA-Z0-9_ -]{5,25}$');
export const AgentInitConfiguration = z.object({
	name: z.string().regex(nameRegex),
	description: z.string().min(20).max(500),
	model: z.string().default(DEFAULT_OPENAI_MODEL),
});
