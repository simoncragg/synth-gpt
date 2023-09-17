import type {
	AssistantMessageSegmentPayload
} from "./types";

import type { 
	Chat, 
	ChatMessage, 
	CodingActivity, 
	MessageSegment,
	WebActivity
} from "../types";

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
	
	private assistantMessage: ChatMessage = null;
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

		if (this.assistantMessage.activity) {
			await this.processActivity();
		}
		else {
			this.chat.messages.push(this.assistantMessage);
		}
	}

	private async processSegment(segment: MessageSegment) {
		const { message } = segment;

		if (message.content) {
			await this.processContentSegment(segment);
		}

		if (message.activity) {
			await this.processActivitySegment(segment);
		}
	}

	private async processContentSegment(segment: MessageSegment) {
		const { message } = segment;
		
		if (this.isCodeBoundary(message.content)) {
			this.isInsideCodeBlock = !this.isInsideCodeBlock;
		}
		else if (!this.isInsideCodeBlock) {
			await this.assistantVoiceProcessor.process(message);
		}
	
		if (!this.assistantMessage) {
			this.assistantMessage = structuredClone(message);
		}
		else {
			this.assistantMessage.content += message.content;
		}

		this.postToClient(segment);
	}

	private async processActivitySegment(segment: MessageSegment) {
		const { message } = segment;
		if (message.activity?.type === "codingActivity") {
			await this.processCodingActivitySegment(segment);
		}
		else if (message.activity?.type === "webActivity") {
			await this.processWebActivitySegment(segment);
		}
	}

	private async processCodingActivitySegment(segment: MessageSegment) {
		const { message } = segment;

		if (!this.assistantMessage) {
			this.assistantMessage = structuredClone(message);
		}
		else
		{
			if (!this.assistantMessage.activity) {
				this.assistantMessage.activity = structuredClone(message.activity);
			}
			const { code } = message.activity.value as CodingActivity;
			(this.assistantMessage.activity.value as CodingActivity).code = code;
		}

		await this.postToClient(segment);
	}

	private async processWebActivitySegment(segment: MessageSegment) {
		const { message } = segment;

		if (!this.assistantMessage) {
			this.assistantMessage = structuredClone(message);
		}
		else
		{
			if (!this.assistantMessage.activity) {
				this.assistantMessage.activity = structuredClone(message.activity);
			}
			const { searchTerm } = message.activity.value as WebActivity;
			(this.assistantMessage.activity.value as WebActivity).searchTerm = searchTerm;
		}

		await this.postToClient(segment);
	}

	private async processActivity() {
		const { activity } = this.assistantMessage;

		if (activity.type === "codingActivity") {
			await this.codingActivityProcessor.process(this.assistantMessage);
		}
		else if (activity?.type === "webActivity") {
			return await this.webActivityProcessor.process(this.assistantMessage);
		}
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
