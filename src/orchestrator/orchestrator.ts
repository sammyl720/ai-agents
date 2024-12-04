import type OpenAI from "openai";
import type { IAgent, IOrchestrator } from "../types.js";
import { MessageHandler } from "../message-handler/message-handler.js";
import type { ChatCompletionTool } from "openai/resources/index.mjs";

export class Orchestrator implements IOrchestrator {
    private instructions = '';
    private messageHandler = new MessageHandler();
    private tools: ChatCompletionTool[] = [];

    constructor(
        private openai: OpenAI,
        private agents: IAgent[]
    )
    {}

    getAgentsDetails(): string {
        return this.agents.reduce((details, current) => {
            return `${details}${current}`
        }, "")
    }
    
    get Instructions() {
        return this.instructions;
    }

    run(instrucions: string) {
        this.instructions = instrucions;
        this.messageHandler = new MessageHandler();
        this.tools = this.agents.map((agent) => {
            return agent.initialize(this);
        });
        this.messageHandler.addMessage({
            role: 'system',
            content: this.getOrchestratorSystemPrompt()
        })
    }

    getOrchestratorSystemPrompt(): string {
        return `## You are a project lead of a team of agents tasked to complete the following goal:
        ${this.instructions}
        
        #### Your responsibility as the project lead is as follows:
        1. Create tasks aimed at achieving the aforementioned goal.
        2. Delegate (i.e hand of tasks) to agents on the team .
        3. Keep creating and delegating tasks until the goal is achieved or when, in the rear case, deemed unacheivable.

        You be assigned tasks that are suited for you given your designation.

        ### Agent's on your team
        ${this.getAgentsDetails()}
        
        You've be suppled with tools to hand of tasks to agent's on your team.`
    }
}