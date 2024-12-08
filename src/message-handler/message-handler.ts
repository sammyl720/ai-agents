import type { CompletionMessage, IMessageHandler } from '@definitions';

export class MessageHandler implements IMessageHandler {
	private messages: CompletionMessage[] = [];

	addMessages(messages: CompletionMessage[]) {
		return messages.reduce((self, current) => self.addMessage(current), this);
	}

	addMessage(message: CompletionMessage) {
		this.messages.push(message);
		return this;
	}

	getMessages() {
		return structuredClone(this.messages);
	}

	getLastMessage() {
		return this.getMessages().pop();
	}
}
