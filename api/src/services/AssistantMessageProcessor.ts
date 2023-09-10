import { v4 as uuidv4 } from "uuid";

import type { AssistantMessageSegmentPayload } from "./types";
import type { Chat, ChatMessage, CodingActivity, MessageSegment } from "../types";

import AssistantVoiceProcessor from "./AssistantVoiceProcessor";
import ChatCompletionService from "@services/ChatCompletionService";
import CodingActivityProcessor from "./CodingActivityProcessor";
import WebActivityProcessor from "./WebActivityProcessor";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { singleLineCodeBlockPattern } from "../constants";

class AssistantMessageProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly chatCompletionService: ChatCompletionService;
	private readonly codingActivityProcessor: CodingActivityProcessor;
	private readonly webActivityProcessor: WebActivityProcessor;
	private readonly assistantVoiceProcessor: AssistantVoiceProcessor;
	
	private assistantMessage?: ChatMessage = null;
	private codingActivityMessage?: ChatMessage = null;
	private webActivityMessage?: ChatMessage = null;
	private isInsideCodeBlock = false;
		
	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.chatCompletionService = new ChatCompletionService();
		this.codingActivityProcessor = new CodingActivityProcessor(connectionId, chat);
		this.webActivityProcessor = new WebActivityProcessor(connectionId, chat);
		this.assistantVoiceProcessor = new AssistantVoiceProcessor(connectionId, chat);
	}

	async process(): Promise<void> {
		await this.chatCompletionService.generateAssistantMessageSegmentsAsync(
			this.chat.model,
			this.chat.messages,
			async (segment: MessageSegment) => this.processSegment(segment)
		);

		if (this.assistantMessage) {
			this.chat.messages = [...this.chat.messages, this.assistantMessage];
		}

		else if (this.codingActivityMessage) {
			await this.codingActivityProcessor.process(this.codingActivityMessage);
		}
		
		else if (this.webActivityMessage) {
			await this.webActivityProcessor.process(this.webActivityMessage);
		}
	}

	private async processSegment(segment: MessageSegment) {
		const { message } = segment;

		if (message.content.type === "codingActivity") {
			await this.processCodingActivitySegment(segment);
		}

		else if (message.content.type === "webActivity") {
			await this.processWebActivitySegment(segment);
		}

		else {
			await this.processTextMessage(segment);
		}
	}

	private async processCodingActivitySegment(segment: MessageSegment) {
		const { message } = segment;
		if (!this.codingActivityMessage) {
			this.codingActivityMessage = {
				...message,
				content: {
					...message.content
				},
			};
		}
		else {
			const { code } = message.content.value as CodingActivity;
			(this.codingActivityMessage.content.value as CodingActivity).code = code;
		}
		await this.postToClient(segment);
	}

	private async processWebActivitySegment(segment: MessageSegment) {
		const { message } = segment;
		this.webActivityMessage = {
			...message,
			id: uuidv4(),
			content: {
				...message.content
			}
		};
	}

	private async processTextMessage(segment: MessageSegment) {
		const { message } = segment;
		
		const value = message.content.value as string;
		if (this.isCodeBoundary(value)) {
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
			this.assistantMessage.content.value += message.content.value as string;
		}

		this.postToClient(segment);
	}

	private isCodeBoundary(value: string): boolean {
		return value.includes("```") && !value.match(singleLineCodeBlockPattern);
	}

	private async postToClient({ message, isLastSegment }: MessageSegment) {
		const { chatId } = this.chat;
		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
				message,
				isLastSegment,
			} as AssistantMessageSegmentPayload,
		});
	}
}

export default AssistantMessageProcessor;
