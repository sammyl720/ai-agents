import type { ILogger } from '@definitions';

export class NoOpLogger implements ILogger {
	info(message: string): void {}
	warn(message: string): void {}
	error(message: string, error?: Error): void {}
	debug(message: string): void {}
}
