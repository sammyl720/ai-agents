import type OpenAI from "openai";
import type { CompletionMessage, MessageHandler } from "../message-handler/message-handler.js";

export interface IMessageRunner {
    run(messageHandler: MessageHandler): Promise<CompletionMessage|null>;
}

export class MessageRunner implements IMessageRunner {
    constructor(
        private openai: OpenAI,
        private model: string 
    )
    {

    }

    async run(messageHandler: MessageHandler): Promise<CompletionMessage|null> {
        const response = await this.openai.chat.completions.create({
            messages: messageHandler.getMessages(),
            model: this.model
        });

        const newMessage = response.choices[0]?.message;
        if (newMessage) {
            messageHandler.addMessage(newMessage);
        }
        return newMessage ?? null;
    }

}