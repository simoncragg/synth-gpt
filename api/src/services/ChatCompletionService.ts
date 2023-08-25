import { v4 as uuidv4 } from "uuid";

import type {
	ChatMessage,
	CodeAttachment,
	FileAttachment,
	FunctionResult,
	MessageSegment,
} from "../types";

import type {
	Delta,
	FunctionCall,
	ChatCompletionMessage,
} from "@clients/openaiApiClient";

import {
	generateChatResponseAsync,
	generateChatResponseDeltasAsync
} from "@clients/openaiApiClient";

import { functions } from "../functions";
import { prePrompt } from "../constants";

export default class ChatCompletionService {

	async generateAssistantMessageAsync(chatMessages: ChatMessage[]): Promise<ChatMessage> {
		const messages = [
			{
				role: "system",
				content: prePrompt,
			},
			...this.mapMessages(chatMessages),
		] as ChatCompletionMessage[];

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
		] as ChatCompletionMessage[];

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

	private mapMessages(chatMessages: ChatMessage[]): ChatCompletionMessage[] {
		return chatMessages
			.filter(msg => msg.content.type !== "webActivity")
			.map(msg => msg.role === "function"
				? {
					role: msg.role,
					name: (msg.content.value as FunctionResult).name,
					content: (msg.content.value as FunctionResult).result,
				} : {
					role: msg.role,
					content: this.convertToMarkdown(msg) as string
				});
	}

	private convertToMarkdown(message: ChatMessage) {
		let markdown = `${message.content.value}\n\n`;
		for (const attachment of message.attachments) {
			if (attachment.type === "File") {
				const { file } = attachment as FileAttachment;
				markdown += `\`\`\`${file.name}\n${file.contents}\n\`\`\`\n\n`;
			}
			if (attachment.type === "CodeSnippet") {
				const { content: { language, code } } = attachment as CodeAttachment;
				markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
			}
		}
		return markdown;
	}

	private buildChatMessageFromContent(id: string, content: string): ChatMessage {
		return {
			id,
			role: "assistant",
			attachments: [],
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
			attachments: [],
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