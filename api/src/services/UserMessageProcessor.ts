import { v4 as uuidv4 } from "uuid";
import { newChatText } from "../constants";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { ChatRepository } from "@repositories/ChatRepository";
import ChatCompletionService from "@services/ChatCompletionService";
import TextToSpeechService from "@services/TextToSpeechService";

export default class UserMessageProcessor {

	private readonly chatRepository: ChatRepository;
	private readonly chatCompletionService: ChatCompletionService;
	private readonly textToSpeechService: TextToSpeechService;

	constructor() {
		this.chatRepository = new ChatRepository();
		this.chatCompletionService = new ChatCompletionService();
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

		const [, assistantMessage] = await Promise.all([
			this.persistChatIfNewAsync(chat),
			this.chatCompletionService.generateAssistantMessageAsync(chat.messages)
		]);

		if (assistantMessage.content.type === "webActivity") {
			await this.processWebActivityMessage(
				connectionId,
				assistantMessage,
				chat
			);
		}
		else if (assistantMessage.content.type === "text") {
			await this.processTextMessage(
				connectionId, {
					chatId,
					message: assistantMessage,
				} as AssistantMessagePayload,
				chat
			);
		}

		await this.updateChatAsync(chat);
	}

	private async getChatAsync(
		chatId: string,
		userId: string
	) {
		return await this.chatRepository.getByChatIdAsync(chatId) ?? {
			chatId,
			title: newChatText,
			userId,
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
		};
	}

	private async persistChatIfNewAsync(chat: Chat) {
		if (chat.messages.length === 1) {
			await this.chatRepository.updateItemAsync(chat);
		}
	}

	private async processWebActivityMessage(
		connectionId: string,
		assistantMessage: ChatMessage,
		chat: Chat) {

		const { searchTerm } = (assistantMessage.content.value as WebActivity);

		const webActivity = {
			...(assistantMessage.content.value as WebActivity),
			actions: [{
				type: "searching",
				searchTerm,
			}]
		};

		await postToConnectionAsync(connectionId, {
			type: "assistantMessage",
			payload: {
				chatId: chat.chatId,
				message: {
					...assistantMessage,
					content: {
						type: "webActivity",
						value: webActivity,
					},
				},
			},
		});

		const { webPages } = await performWebSearchAsync(
			searchTerm
		);

		const results = webPages.value.map(({ name, url, isFamilyFriendly, snippet }) => ({
			name,
			url,
			isFamilyFriendly,
			snippet
		} as WebSearchResult));

		await postToConnectionAsync(connectionId, {
			type: "assistantMessage",
			payload: {
				chatId: chat.chatId,
				message: {
					...assistantMessage,
					content: {
						type: "webActivity",
						value: {
							...webActivity,
							currentState: "readingResults",
							actions: [
								...webActivity.actions,
								{
									type: "readingResults",
									results,
								} as ReadingWebSearchResultsAction
							]
						}
					},
				},
			},
		});

		const userMessage = {
			id: uuidv4(),
			role: "user" as const,
			content: {
				type: "text" as const,
				value: [
					"```json",
					`{webSearchResults: ${JSON.stringify(results)}}`,
					"```"
				].join("\n"),
			},
			timestamp: Date.now(),
		};

		const updatedAssistantMessage = {
			...assistantMessage,
			content: {
				type: "webActivity",
				value: {
					...webActivity,
					currentState: "finished",
					actions: [
						...webActivity.actions,
						{
							type: "readingResults",
							results,
						} as ReadingWebSearchResultsAction
					]
				}
			},
		} as ChatMessage;

		chat.messages.push(updatedAssistantMessage);
		chat.messages.push(userMessage);

		const finalAssistantMessage = await this.chatCompletionService
			.generateAssistantMessageAsync(chat.messages);

		Promise.all([
			await postToConnectionAsync(connectionId, {
				type: "assistantMessage",
				payload: {
					chatId: chat.chatId,
					message: updatedAssistantMessage,
				},
			}),
			await this.processTextMessage(connectionId,
				{
					chatId: chat.chatId,
					message: finalAssistantMessage,
				},
				chat
			)]);
	}

	private async processTextMessage(
		connectionId: string,
		assistantMessagePayload: AssistantMessagePayload,
		chat: Chat) {

		chat.messages.push(assistantMessagePayload.message);
		await postToConnectionAsync(connectionId, {
			type: "assistantMessage",
			payload: assistantMessagePayload,
		});

		await this.processAssistantVoiceAsync(
			connectionId,
			assistantMessagePayload
		);
	}

	private async processAssistantVoiceAsync(
		connectionId: string,
		{
			chatId,
			message,
		}: AssistantMessagePayload
	) {
		const transcript = message
			.content
			.value
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