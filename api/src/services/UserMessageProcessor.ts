import { v4 as uuidv4 } from "uuid";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { newChatText, prePrompt } from "../constants";
import { postToConnectionAsync } from "@proxies/apiGatewayManagementApiClientProxy";
import { ChatRepository } from "@repositories/ChatRepository";
import TextToSpeechService from "@services/TextToSpeechService";

export default class UserMessageProcessor {

	private readonly chatRepository: ChatRepository;
	private readonly textToSpeechService: TextToSpeechService;

	constructor() {
		this.chatRepository = new ChatRepository();
		this.textToSpeechService = new TextToSpeechService();
	}

	async process({
		connectionId,
		chatId,
		userId,
		message,
	}: ProcessUserMessagePayload) {

		const chat = await this.getChatAsync(chatId, userId);
		chat.messages.push(message);

		const assistantMessage = await this.generateAssistantMessageAsync(
			chat
		);

		chat.messages.push(assistantMessage);

		const assistantMessagePayload = {
			chatId,
			message: assistantMessage
		};

		await this.postAssistantMessagePayloadAsync(
			connectionId, assistantMessagePayload
		);

		await this.processAssistantVoiceAsync(
			connectionId,
			assistantMessagePayload
		);

		await this.updateChatAsync(chat);
	}

	private async getChatAsync(chatId: string, userId: string): Promise<Chat> {
		return await this.chatRepository.getByChatIdAsync(chatId) ?? {
			chatId,
			title: newChatText,
			userId,
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
		};
	}

	private async generateAssistantMessageAsync(
		chat: Chat
	): Promise<ChatMessage> {
		const { content } = await generateChatResponseAsync(
			[
				{
					role: "system",
					content: prePrompt,
				},
				...chat.messages.map(msg => {
					return { role: msg.role, content: msg.content };
				})
			]
		);

		return {
			id: uuidv4(),
			role: "assistant",
			content,
			timestamp: Date.now(),
		};
	}

	private async postAssistantMessagePayloadAsync(
		connectionId: string,
		payload: AssistantMessagePayload) {
		await postToConnectionAsync(connectionId, {
			type: "assistantMessage" as const,
			payload,
		} as WebSocketMessage);
	}

	private async processAssistantVoiceAsync(
		connectionId: string,
		{
			chatId,
			message,
		}: AssistantMessagePayload) {

		const transcript = message
			.content
			.replace(/```[\s\S]*?```/g, "");

		if (transcript.length === 0) {
			return;
		}

		const audioUrl = await this.textToSpeechService
			.generateSignedAudioUrlAsync(transcript);

		await postToConnectionAsync(connectionId, {
			type: "assistantAudio" as const,
			payload: {
				chatId,
				transcript,
				audioUrl
			} as AssistantAudioPayload
		} as WebSocketMessage);
	}

	private async updateChatAsync(chat: Chat) {
		chat.updatedTime = Date.now();
		await this.chatRepository.updateItemAsync(chat);
	}
}