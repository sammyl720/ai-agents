import type { CompletionMessage, ILogger, IMessageHandler } from '@definitions';
import { NoOpLogger } from '@loggers';

export class MessageHandler implements IMessageHandler {
	private messages: CompletionMessage[] = [];
	constructor(private logger: ILogger = new NoOpLogger()) {}
	addMessages(messages: CompletionMessage[]) {
		return messages.reduce((self, current) => self.addMessage(current), this);
	}

	addMessage(message: CompletionMessage) {
		this.messages.push(message);
		this.logger.info(JSON.stringify(message));
		return this;
	}

	getMessages() {
		return structuredClone(this.messages);
	}

	getLastMessage() {
		return this.getMessages().pop();
	}
}
