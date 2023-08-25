import type { ChatMessage, MessageSegment } from "../types";
import { v4 as uuidv4 } from "uuid";

import type { Delta, FunctionCall, ChatCompletionMessage } from "@clients/openaiApiClient";
import ChatCompletionMessageMapper from "@mappers/ChatCompletionMessageMapper";
import { functions } from "../functions";
import { generateChatResponseAsync, generateChatResponseDeltasAsync} from "@clients/openaiApiClient";
import { prePrompt } from "../constants";

class ChatCompletionService {
	private chatCompletionMessageMapper: ChatCompletionMessageMapper;

	constructor() {
		this.chatCompletionMessageMapper = new ChatCompletionMessageMapper();
	}

	async generateAssistantMessageAsync(chatMessages: ChatMessage[]): Promise<ChatMessage> {
		const messages = this.buildMessages(chatMessages);
		const { content } = await generateChatResponseAsync({
			messages,
			functions,
		});
		return this.buildChatMessageWithTextContent(uuidv4(), content);
	}

	async generateAssistantMessageSegmentsAsync(chatMessages: ChatMessage[], onSegmentReceived: (segment: MessageSegment) => Promise<void>) {
		const messages = this.buildMessages(chatMessages);
		const functionCall: FunctionCall = { name: "", arguments: "" };
		const id = uuidv4();
		const request = { messages, functions };

		let content = "";
		await generateChatResponseDeltasAsync(
			request,
			async (delta: Delta, finishReason: string) => {
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
					const message =
						finishReason === "function_call"
							? this.buildChatMessageWithFunctionCall(id, functionCall)
							: this.buildChatMessageWithTextContent(id, content);
					await onSegmentReceived({
						message,
						isLastSegment: finishReason !== null,
					});
					content = "";
					functionCall.name = "";
					functionCall.arguments = "";
				}
			}
		);
	}

	private buildMessages(chatMessages: ChatMessage[]): ChatCompletionMessage[] {
		return [
			{ role: "system", content: prePrompt },
			...this.chatCompletionMessageMapper.mapFromChatMessages(chatMessages),
		];
	}

	private buildChatMessageWithTextContent(
		id: string,
		content: string
	): ChatMessage {
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

	private buildChatMessageWithFunctionCall(
		id: string,
		functionCall: FunctionCall
	): ChatMessage {
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
		return functionCall.name === "perform_web_search"
			? JSON.parse(functionCall.arguments).search_term
			: null;
	}
}

export default ChatCompletionService;
