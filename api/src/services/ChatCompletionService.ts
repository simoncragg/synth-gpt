import { v4 as uuidv4 } from "uuid";

import type { 
	ChatMessage, 
	ChatModelType, 
	MessageSegment
} from "../types";

import type { 
	Delta, 
	ChatCompletionMessage
} from "@clients/openaiApiClient";

import ChatCompletionMessageMapper from "@mappers/ChatCompletionMessageMapper";
import ChatMessageBuilder from "@builders/ChatMessageBuilder";
import ChatCompletionDeltaProcessor from "./ChatCompletionDeltaProcessor";
import { functions } from "../functions";
import { generateChatResponseAsync, generateChatResponseDeltasAsync} from "@clients/openaiApiClient";
import { prePrompt } from "../constants";

export type MessageSegmentCallbackType = (segment: MessageSegment) => Promise<void>;

class ChatCompletionService {
	private readonly chatCompletionMessageMapper: ChatCompletionMessageMapper;
	private readonly chatMessageBuilder: ChatMessageBuilder;

	constructor() {
		this.chatCompletionMessageMapper = new ChatCompletionMessageMapper();
		this.chatMessageBuilder = new ChatMessageBuilder();
	}

	async generateAssistantMessageAsync(model: ChatModelType, chatMessages: ChatMessage[]): Promise<ChatMessage> {
		const messages = this.buildMessages(chatMessages);

		const { content } = await generateChatResponseAsync({
			model,
			messages,
			functions,
		});

		return this.chatMessageBuilder.buildChatMessageWithContent(uuidv4(), content);
	}

	async generateAssistantMessageSegmentsAsync(model: ChatModelType, chatMessages: ChatMessage[], onSegmentReceived: MessageSegmentCallbackType) {
		const messages = this.buildMessages(chatMessages);
		const request = { model, messages, functions };
		const processor = new ChatCompletionDeltaProcessor(onSegmentReceived);

		await generateChatResponseDeltasAsync(
			request, 
			async (delta: Delta, finishReason: string) => processor.processDelta(delta, finishReason)
		);
	}

	private buildMessages(chatMessages: ChatMessage[]) {
		return [
			{ role: "system", content: prePrompt } as ChatCompletionMessage,
			...chatMessages.flatMap(chatMessage => this.chatCompletionMessageMapper.mapFromChatMessage(chatMessage))
		];
	}
}

export default ChatCompletionService;
