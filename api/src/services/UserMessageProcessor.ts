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

		const assistantMessage = await this.generateAssistantMessageAsync(chat);
		await postToConnectionAsync(connectionId, {
			type: "assistantMessage" as const,
			payload: {
				chatId,
				message: assistantMessage
			} as AssistantMessagePayload
		} as WebSocketMessage);

		const transcript = assistantMessage.content.replace(/```[\s\S]*?```/g, "");
		const audioUrl = await this.textToSpeechService.generateSignedAudioUrlAsync(transcript);
		await postToConnectionAsync(connectionId, {
			type: "assistantAudio" as const,
			payload: {
				chatId,
				transcript,
				audioUrl
			} as AssistantAudioPayload
		} as WebSocketMessage);

		chat.messages.push(assistantMessage);
		chat.updatedTime = Date.now();
		await this.chatRepository.updateItemAsync(chat);
	}

	private async generateAssistantMessageAsync(
		chat: Chat
	): Promise<ChatMessage> {
		const { content } = await generateChatResponseAsync(
			[
				{
					role: "system" as const,
					content: prePrompt,
				},
				...chat.messages.map(msg => {
					return { role: msg.role, content: msg.content };
				})
			]
		);

		return {
			id: uuidv4(),
			role: "assistant" as const,
			content,
			timestamp: Date.now(),
		};
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
}