import { v4 as uuidv4 } from "uuid";

import type {
	ChatMessage,
	Content,
	MessageSegment,
	WebActivity
} from "../types";

import {
	generateChatResponseAsync,
	generateChatResponseDeltasAsync
} from "@clients/openaiApiClient";
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
		return this.buildChatMessage(uuidv4(), content);
	}

	async generateAssistantMessageSegmentsAsync(
		chatMessages: ChatMessage[],
		onSegmentReceived: (segment: MessageSegment) => Promise<{ abort: boolean }>
	): Promise<void> {
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
		let content = "";
		const id = uuidv4();
		await generateChatResponseDeltasAsync(messages, async (delta: string, done: boolean): Promise<{ abort: boolean }> => {
			content += delta ?? "";
			if (done || delta?.indexOf("\n") > 0) {
				const segment = {
					message: this.buildChatMessage(id, content),
					isLastSegment: done,
				};
				content = "";
				return await onSegmentReceived(segment);
			}
			return { abort: false };
		});
	}

	private buildChatMessage(id: string, content: string): ChatMessage {
		if (this.isSearchPrompt(content)) {
			const searchTerm = this.extractSearchTerm(content);
			return {
				id,
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
			id,
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
			? `SEARCH[${(content.value as WebActivity).searchTerm}]`
			: content.value as string;
	}

	private isSearchPrompt(line: string): boolean {
		return /SEARCH\[.+?\]/.test(line);
	}

	private extractSearchTerm(input: string): string | null {
		const match = input.match(/SEARCH\[(.+?)\]/);
		return match ? match[1] : null;
	}
}