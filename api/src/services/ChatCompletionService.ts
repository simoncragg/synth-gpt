import { v4 as uuidv4 } from "uuid";

import type {
	ChatMessage,
	FunctionResult,
	MessageSegment,
} from "../types";

import type {
	Delta,
	FunctionCall,
	Message,
} from "@clients/openaiApiClient";

import {
	generateChatResponseAsync,
	generateChatResponseDeltasAsync
} from "@clients/openaiApiClient";

import { functions } from "../functions";
import { prePrompt } from "../constants";

export default class ChatCompletionService {

	async generateAssistantMessageAsync(
		chatMessages: ChatMessage[]
	): Promise<ChatMessage> {

		const messages = [
			{
				role: "system",
				content: prePrompt,
			},
			...this.mapMessages(chatMessages),
		] as Message[];

		const { content } = await generateChatResponseAsync({ messages, functions });
		return this.buildChatMessageFromContent(uuidv4(), content);
	}

	async generateAssistantMessageSegmentsAsync(
		chatMessages: ChatMessage[],
		onSegmentReceived: (segment: MessageSegment) => Promise<void>
	): Promise<void> {

		const messages = [
			{
				role: "system",
				content: prePrompt,
			},
			...this.mapMessages(chatMessages),
		] as Message[];

		let content = "";
		const functionCall: FunctionCall = {
			name: "",
			arguments: "",
		};
		const id = uuidv4();
		const request = { messages, functions };

		await generateChatResponseDeltasAsync(request, async (delta: Delta, finishReason: string) => {
			let flushSegment = finishReason !== null;
			if (delta.content) {
				content += delta.content ?? "";
				if (delta.content?.indexOf("\n") > 0) {
					flushSegment = true;
				}
			} else if (delta.function_call) {
				if (delta.function_call.name) {
					functionCall.name += delta.function_call.name;
				}
				if (delta.function_call.arguments) {
					functionCall.arguments += delta.function_call.arguments;
				}
			}

			if (flushSegment) {
				const message = (finishReason === "function_call")
					? this.buildChatMessageFromFunctionCall(id, functionCall)
					: this.buildChatMessageFromContent(id, content);
				await onSegmentReceived({
					message,
					isLastSegment: finishReason !== null,
				});
				content = "";
				functionCall.name = "";
				functionCall.arguments = "";
			}
		});
	}

	private mapMessages(chatMessages: ChatMessage[]): Message[] {
		return chatMessages
			.filter(msg => msg.content.type !== "webActivity")
			.map(msg => msg.role === "function"
				? {
					role: msg.role,
					name: (msg.content.value as FunctionResult).name,
					content: (msg.content.value as FunctionResult).result,
				} : {
					role: msg.role,
					content: msg.content.value as string
				});
	}

	private buildChatMessageFromContent(id: string, content: string): ChatMessage {
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

	private buildChatMessageFromFunctionCall(id: string, functionCall: FunctionCall): ChatMessage {
		const searchTerm = this.extractSearchTerm(functionCall);
		return {
			id,
			role: "assistant",
			content: {
				type: "webActivity",
				value: {
					searchTerm,
					currentState: "searching",
					actions: [],
				},
			},
			timestamp: Date.now(),
		};
	}

	private extractSearchTerm(functionCall: FunctionCall): string | null {
		return (functionCall.name === "perform_web_search")
			? JSON.parse(functionCall.arguments).search_term
			: null;
	}
}