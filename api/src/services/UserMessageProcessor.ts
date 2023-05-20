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

		await Promise.all([
			this.persistChatIfNewAsync(chat),
			await this.generateAssistantMessageDeltasAsync(
				chat,
				connectionId
			)
		]);

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

	private async generateAssistantMessageDeltasAsync(
		chat: Chat,
		connectionId: string)
		: Promise<void> {

		let assistantMessage: ChatMessage | null;
		let webActivityMessage: ChatMessage | null;
		let isInCodeBlock = false;

		await this.chatCompletionService.generateAssistantMessageDeltasAsync(
			chat.messages,
			async (delta: ChatMessage): Promise<{ abort: boolean }> => {

				if (delta.content.type === "webActivity") {
					webActivityMessage = {
						...delta,
						id: uuidv4(),
						content: {
							...delta.content
						}
					};
					console.log(webActivityMessage);
					return { abort: true };
				}

				console.log({
					chatId: chat.chatId,
					message: delta
				});

				await postToConnectionAsync(connectionId, {
					type: "assistantMessage",
					payload: {
						chatId: chat.chatId,
						message: delta
					},
				});

				const value = delta.content.value as string;

				if (value.indexOf("```") > -1) {
					isInCodeBlock = !isInCodeBlock;
				}
				else if (!isInCodeBlock) {
					await this.processAssistantVoiceAsync(connectionId, {
						chatId: chat.chatId,
						message: delta
					});
				}

				if (!assistantMessage) {
					assistantMessage = {
						...delta,
						content: {
							...delta.content
						},
					};
				}
				else {
					assistantMessage.content.value += value;
				}

				return { abort: false };
			});

		if (assistantMessage) {
			chat.messages = [
				...chat.messages,
				assistantMessage
			];
		}

		if (webActivityMessage) {
			await this.processWebActivityMessage(
				connectionId,
				webActivityMessage,
				chat
			);
		}
	}

	private async processWebActivityMessage(
		connectionId: string,
		assistantMessage: ChatMessage,
		chat: Chat
	): Promise<void> {

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

		console.log("///////////////////////////////////////////////////////////////////");
		console.log(searchTerm);
		console.log("///////////////////////////////////////////////////////////////////");

		const { webPages } = await performWebSearchAsync(
			searchTerm
		);

		const results = webPages.value.map(({ name, url, isFamilyFriendly, snippet }) => ({
			name,
			url,
			isFamilyFriendly,
			snippet
		} as WebSearchResult));

		console.log(results);

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

		await postToConnectionAsync(connectionId, {
			type: "assistantMessage",
			payload: {
				chatId: chat.chatId,
				message: updatedAssistantMessage,
			},
		});

		await Promise.all([
			postToConnectionAsync(connectionId, {
				type: "assistantMessage",
				payload: {
					chatId: chat.chatId,
					message: finalAssistantMessage,
				},
			}),
			this.processAssistantVoiceAsync(connectionId, {
				chatId: chat.chatId,
				message: finalAssistantMessage
			})
		]);

		chat.messages.push(finalAssistantMessage);
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

		const audioSegment = await this.generateAudioSegmentAsync(transcript);

		await postToConnectionAsync(connectionId, {
			type: "assistantAudio" as const,
			payload: {
				chatId,
				audioSegment,
			} as AssistantAudioPayload
		} as WebSocketMessage);
	}

	private async generateAudioSegmentAsync(transcript: string): Promise<AudioSegment> {
		const timestamp = Date.now();
		const audioUrl = await this.textToSpeechService.generateSignedAudioUrlAsync(transcript);
		return {
			audioUrl,
			timestamp,
		};
	}

	private async updateChatAsync(chat: Chat) {
		chat.updatedTime = Date.now();
		await this.chatRepository.updateItemAsync(chat);
	}
}