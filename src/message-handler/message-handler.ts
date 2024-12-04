import OpenAI from "openai";

export type CompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export class MessageHandler {
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