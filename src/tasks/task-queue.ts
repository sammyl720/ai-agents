import type { Task } from './task.js';

export class TaskQueue {
	private tasks: Task[] = [];

	enqueue(task: Task) {
		if (task.Status !== 'Open') {
			throw new Error('Can not queue a task that is not open.');
		}
		this.tasks.unshift(task);
	}

	dequeue() {
		return this.tasks.pop();
	}
}
