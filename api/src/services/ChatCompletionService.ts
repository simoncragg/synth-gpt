import { v4 as uuidv4 } from "uuid";

import type { ChatMessage, ChatModelType, MessageSegment } from "../types";
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

	async generateAssistantMessageAsync(model: ChatModelType, chatMessages: ChatMessage[]): Promise<ChatMessage> {
		const messages = this.buildMessages(chatMessages);
		const { content } = await generateChatResponseAsync({
			model,
			messages,
			functions,
		});
		return this.buildChatMessageWithTextContent(uuidv4(), content);
	}

	async generateAssistantMessageSegmentsAsync(
		model: ChatModelType,
		chatMessages: ChatMessage[], 
		onSegmentReceived: (segment: MessageSegment) => Promise<void>
	) {
		const messages = this.buildMessages(chatMessages);
		const functionCall: FunctionCall = { name: "", arguments: "" };
		const id = uuidv4();
		const request = { model, messages, functions };

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
			...chatMessages.flatMap(chatMessage => this.chatCompletionMessageMapper.mapFromChatMessage(chatMessage)),
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

	private buildChatMessageWithFunctionCall(id: string, functionCall: FunctionCall): ChatMessage {
		return (functionCall.name === "execute_python_code")
			? this.buildCodingActivityMessage(id, functionCall)
			: this.buildWebActivityMessage(id, functionCall);
	}

	private buildCodingActivityMessage(id: string, functionCall: FunctionCall): ChatMessage {
		const code = JSON.parse(functionCall.arguments).code;
		return {
			id,
			role: "assistant",
			attachments: [],
			content: {
				type: "codingActivity",
				value: {
					code,
					currentState: "working",
				},
			},
			timestamp: Date.now(),
		};
	}

	private buildWebActivityMessage(id: string, functionCall: FunctionCall): ChatMessage {
		const searchTerm = JSON.parse(functionCall.arguments).search_term;
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
}

export default ChatCompletionService;
