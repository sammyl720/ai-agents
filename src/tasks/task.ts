import { z } from 'zod';
import { Agent } from '@agent';

import { randomUUID } from 'node:crypto';
import type { TaskSnapshot } from '@definitions';

export const TaskStatus = z.enum([
	'Open',
	'InProgress',
	'Completed',
	'Aborted',
]);

export type TaskChangeDetails = {
	TaskId: string;
	Status: z.infer<typeof TaskStatus>;
};

export class Task implements TaskSnapshot {
	private status: z.infer<typeof TaskStatus> = TaskStatus.Enum.Open;
	private result: string | null = null;
	private abortReason: string | null = null;
	private assignedAgent: Agent | null = null;

	readonly id = randomUUID().toString();

	get Status() {
		return this.status;
	}

	get Result() {
		return this.result;
	}

	get AbortReason() {
		return this.abortReason;
	}

	get AssignedAgent() {
		return this.assignedAgent?.name ?? null;
	}

	constructor(
		/** Description of what needs to be achieved*/
		public readonly description: string,
		/** Optional: Additional context in the form of a json string. */
		public readonly additionalContext: string = '{}',
	) {}

	assign(agent: Agent) {
		if (this.Status !== TaskStatus.Enum.Open) {
			throw new Error("Task's already assigned.");
		}

		this.assignedAgent = agent;
		this.status = TaskStatus.Enum.InProgress;
		return this;
	}

	complete(result: string) {
		if (this.Status !== TaskStatus.Enum.InProgress) {
			throw new Error("Task's is not in progress.");
		}

		this.status = TaskStatus.Enum.Completed;
		this.result = result;
		this.assignedAgent = null;
		return this;
	}

	abort(reason?: string) {
		this.status = TaskStatus.Enum.Aborted;
		this.abortReason = reason ?? 'No reason provided.';
	}

	toJSON() {
		return JSON.stringify({
			id: this.id,
			status: this.status,
			description: this.description,
			additionalContext: JSON.parse(this.additionalContext),
			assignedAgent: this.AssignedAgent,
		});
	}
}
