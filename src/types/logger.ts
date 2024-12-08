/**
 * A logging interface for sending messages at different severity levels.
 */
export interface ILogger {
	/**
	 * Logs a message at the "info" level.
	 * @param message The log message.
	 */
	info(message: string): void;

	/**
	 * Logs a message at the "warning" level.
	 * @param message The log message.
	 */
	warn(message: string): void;

	/**
	 * Logs a message at the "error" level.
	 * @param message The log message.
	 * @param error An optional Error object with additional context.
	 */
	error(message: string, error?: Error): void;

	/**
	 * Logs a message at the "debug" level.
	 * @param message The log message.
	 */
	debug(message: string): void;
}
