import type {
	Chat,
	ChatMessage,
	ChatModelType,
} from "../types";

import AssistantMessageProcessor from "./AssistantMessageProcessor";
import ChatRepository from "@repositories/ChatRepository";
import { newChatText } from "../constants";

export default class UserMessageProcessor {

	private readonly chatRepository: ChatRepository;

	constructor() {
		this.chatRepository = new ChatRepository();
	}

	async process({
		connectionId,
		chatId,
		userId,
		model,
		message,
	}: ProcessUserMessagePayload) {

		const chat = await this.getChatAsync(chatId, userId, model);
		chat.messages.push(message);

		const assistantMessageProcessor = new AssistantMessageProcessor(connectionId, chat);
		await Promise.all([
			this.persistChatIfNewAsync(chat),
			await assistantMessageProcessor.process()
		]);

		await this.updateChatAsync(chat);
	}

	private async getChatAsync(chatId: string, userId: string, model: ChatModelType) {
		const chat = await this.chatRepository.getByChatIdAsync(chatId) ?? {
			chatId,
			title: newChatText,
			userId,
			model,
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
		};
		
		chat.model = model;
		return chat;
	}

	private async persistChatIfNewAsync(chat: Chat) {
		if (chat.messages.length === 1) {
			await this.chatRepository.updateItemAsync(chat);
		}
	}

	private async updateChatAsync(chat: Chat) {
		chat.updatedTime = Date.now();
		await this.chatRepository.updateItemAsync(chat);
	}
}

export interface ProcessUserMessagePayload {
	connectionId: string;
	chatId: string;
	userId: string;
	model: ChatModelType;
	message: ChatMessage;
}