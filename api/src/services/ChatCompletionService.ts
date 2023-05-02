import { v4 as uuidv4 } from "uuid";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { prePrompt } from "../constants";

export default class ChatCompletionService {

	async generateAssistantMessageAsync(
		chatMessages: ChatMessage[]
	): Promise<ChatMessage> {
		const messages = [
			{
				role: "system" as const,
				content: prePrompt,
			},
			...chatMessages.map(msg => {
				return {
					role: msg.role,
					content: this.mapContent(msg.content)
				};
			})
		];

		const { content } = await generateChatResponseAsync(messages);
		return this.mapToChatMessage(content);
	}

	private mapToChatMessage(content: string): ChatMessage {
		if (this.isSearchPrompt(content)) {
			const searchTerm = this.extractSearchTerm(content);
			return {
				id: uuidv4(),
				role: "assistant",
				content: {
					type: "webActivity",
					value: {
						searchTerm,
						currentState: "searching" as const,
						actions: [],
					},
				},
				timestamp: Date.now(),
			};
		}

		return {
			id: uuidv4(),
			role: "assistant",
			content: {
				type: "text",
				value: content,
			},
			timestamp: Date.now(),
		};
	}

	private mapContent(content: Content): string {
		return content.type === "webActivity"
			? `SEARCH: "${(content.value as WebActivity).searchTerm}"`
			: content.value as string;
	}

	private isSearchPrompt(line: string): boolean {
		return /SEARCH: ".+?"/.test(line);
	}

	private extractSearchTerm(input: string): string | null {
		const match = input.match(/SEARCH: "(.+?)"/);
		return match ? match[1] : null;
	}
}