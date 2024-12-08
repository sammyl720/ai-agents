import type { ILogger } from '@definitions';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join, isAbsolute } from 'path';

/**
 * A simple file-based logger implementation of ILogger that:
 * - Ensures the directory for the log file exists, creating it if necessary.
 * - Ensures the log file exists (appendFileSync will create it if not present).
 * - Uses a protected method `formatLogEntry` to allow custom formatting of the log output.
 */
export class FileLogger implements ILogger {
	private logFilePath: string;

	/**
	 * Creates a new FileLogger.
	 * @param logFileName The name of the log file.
	 * @param logDir Optional directory where the log file should be stored.
	 *               Defaults to the current working directory.
	 *               If the provided logDir is not absolute, it will be resolved against the current working directory.
	 */
	constructor(logFileName: string, logDir: string = process.cwd()) {
		if (!isAbsolute(logDir)) {
			logDir = join(process.cwd(), logDir);
		}

		this.logFilePath = join(logDir, logFileName);

		// Ensure the directory exists
		if (!existsSync(logDir)) {
			mkdirSync(logDir, { recursive: true });
		}
	}

	/**
	 * Logs an informational message to the file.
	 * @param message The message to log.
	 */
	info(message: string): void {
		this.writeLog('INFO', message);
	}

	/**
	 * Logs a warning message to the file.
	 * @param message The warning to log.
	 */
	warn(message: string): void {
		this.writeLog('WARN', message);
	}

	/**
	 * Logs an error message to the file, optionally including an Error object.
	 * @param message The error message.
	 * @param error Optional Error object for additional context.
	 */
	error(message: string, error?: Error): void {
		const errMsg = error
			? `${message} | Error stack: ${error.stack ?? 'no stack'}`
			: message;
		this.writeLog('ERROR', errMsg);
	}

	/**
	 * Logs a debug message to the file, useful for development or troubleshooting.
	 * @param message The debug message.
	 */
	debug(message: string): void {
		this.writeLog('DEBUG', message);
	}

	/**
	 * Writes a log entry to the file with a timestamp and severity level.
	 * @param level The severity level of the log message.
	 * @param message The message to log.
	 */
	private writeLog(level: string, message: string): void {
		const timestamp = new Date().toISOString();
		const logEntry = this.formatLogEntry(timestamp, level, message);
		appendFileSync(this.logFilePath, logEntry);
	}

	/**
	 * Formats a single log entry. By default, it returns a string in the format:
	 * [timestamp] [level] message
	 *
	 * Subclasses can override this method to customize the log format.
	 *
	 * @param timestamp The timestamp of the log entry (ISO string).
	 * @param level The severity level (e.g. 'INFO', 'ERROR', etc.).
	 * @param message The message to log.
	 * @returns A formatted log entry string (including a trailing newline).
	 */
	protected formatLogEntry(
		timestamp: string,
		level: string,
		message: string,
	): string {
		return `[${timestamp}] [${level}] ${message}\n`;
	}
}
