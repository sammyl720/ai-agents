import { FileLogger } from './file-logger.js';

/**
 * A logger that writes logs as JSON lines. Each line is a JSON object
 * conforming to this interface:
 *
 * {
 *   "timestamp": string;
 *   "level": string;
 *   "message": string;
 * }
 */
export class JSONLinesFileLogger extends FileLogger {
	/**
	 * Formats a single log entry as a JSON line.
	 *
	 * @param timestamp The timestamp of the log entry (ISO string).
	 * @param level The severity level (e.g. 'INFO', 'ERROR', etc.).
	 * @param message The message to log.
	 * @returns A JSON-formatted string with a trailing newline.
	 */
	protected override formatLogEntry(
		timestamp: string,
		level: string,
		message: string,
	): string {
		const entry = {
			timestamp,
			level,
			message: this.parseJson(message),
		};
		return JSON.stringify(entry) + ',\n';
	}

	private parseJson(json: string): string | unknown {
		try {
			const parsed = JSON.parse(json);
			return parsed;
		} catch (error) {
			return json;
		}
	}
}
