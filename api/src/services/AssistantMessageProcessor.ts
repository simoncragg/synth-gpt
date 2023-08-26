import { v4 as uuidv4 } from "uuid";

import type { AssistantMessageSegmentPayload } from "./types";
import type { Chat, ChatMessage, MessageSegment } from "../types";

import AssistantVoiceProcessor from "./AssistantVoiceProcessor";
import ChatCompletionService from "@services/ChatCompletionService";
import WebActivityProcessor from "./WebActivityProcessor";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { singleLineCodeBlockPattern } from "../constants";

class AssistantMessageProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly chatCompletionService: ChatCompletionService;
	private readonly webActivityProcessor: WebActivityProcessor;
	private readonly assistantVoiceProcessor: AssistantVoiceProcessor;
	
	private assistantMessage?: ChatMessage = null;
	private webActivityMessage?: ChatMessage = null;
	private isInsideCodeBlock = false;
		
	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.chatCompletionService = new ChatCompletionService();
		this.webActivityProcessor = new WebActivityProcessor(connectionId, chat);
		this.assistantVoiceProcessor = new AssistantVoiceProcessor(connectionId, chat);
	}

	async process(): Promise<void> {

		await this.chatCompletionService.generateAssistantMessageSegmentsAsync(
			this.chat.messages,
			async (segment: MessageSegment) => this.processSegment(segment)
		);

		if (this.assistantMessage) {
			this.chat.messages = [...this.chat.messages, this.assistantMessage];
		}

		if (this.webActivityMessage) {
			await this.webActivityProcessor.process(this.webActivityMessage);
		}
	}

	private async processSegment(segment: MessageSegment) {

		const { message, isLastSegment } = segment;
		const { chatId } = this.chat;

		if (message.content.type === "webActivity") {
			this.webActivityMessage = {
				...message,
				id: uuidv4(),
				content: {
					...message.content
				}
			};
			return;
		}

		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
				message,
				isLastSegment,
			} as AssistantMessageSegmentPayload,
		});

		const value = message.content.value as string;

		if (value.includes("```") && !value.match(singleLineCodeBlockPattern)) {
			this.isInsideCodeBlock = !this.isInsideCodeBlock;
		}
		else if (!this.isInsideCodeBlock) {
			await this.assistantVoiceProcessor.process(message);
		}

		if (!this.assistantMessage) {
			this.assistantMessage = {
				...message,
				content: {
					...message.content
				},
			};
		}
		else {
			this.assistantMessage.content.value += value;
		}
	}
}

export default AssistantMessageProcessor;
