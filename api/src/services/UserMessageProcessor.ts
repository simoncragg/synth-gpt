import { v4 as uuidv4 } from "uuid";
import type { Attachment } from "../types";

import ChatCompletionService from "@services/ChatCompletionService";
import ChatRepository from "@repositories/ChatRepository";
import TextToSpeechService from "@services/TextToSpeechService";
import { newChatText } from "../constants";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

import type {
	Chat,
	ChatMessage,
	MessageSegment,
} from "../types";

import type {
	BaseWebSocketMessagePayload,
	FunctionResult,
	ReadingWebSearchResultsAction,
	SearchingWebAction,
	WebActivity,
	WebSearchResult,
	WebSocketMessage,
} from "../types";

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

		await this.chatCompletionService.generateAssistantMessageSegmentsAsync(
			chat.messages,
			async (segment: MessageSegment): Promise<void> => {

				const { message, isLastSegment } = segment;

				if (message.content.type === "webActivity") {
					webActivityMessage = {
						...message,
						id: uuidv4(),
						content: {
							...message.content
						}
					};

					return;
				}

				await postToConnectionAsync(connectionId, {
					type: "assistantMessageSegment",
					payload: {
						chatId: chat.chatId,
						message,
						isLastSegment,
					} as AssistantMessageSegmentPayload,
				});

				const value = message.content.value as string;

				if (value.indexOf("```") > -1) {
					if (!value.match(/```[\s\S]*?```/g)) {
						isInCodeBlock = !isInCodeBlock;
					}
				}
				else if (!isInCodeBlock) {
					await this.processAssistantVoiceAsync(
						connectionId,
						chat,
						message,
					);
				}

				if (!assistantMessage) {
					assistantMessage = {
						...message,
						content: {
							...message.content
						},
					};
				}
				else {
					assistantMessage.content.value += value;
				}
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
			actions: [
				{
					type: "searching",
					searchTerm,
				} as SearchingWebAction
			]
		};

		await postToConnectionAsync(connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId: chat.chatId,
				message: {
					...assistantMessage,
					content: {
						type: "webActivity",
						value: webActivity,
					},
				},
				isLastSegment: false,
			} as AssistantMessageSegmentPayload,
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
			type: "assistantMessageSegment",
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
								} as ReadingWebSearchResultsAction,
							]
						}
					},
				},
				isLastSegment: false,
			} as AssistantMessageSegmentPayload,
		});

		const functionMessage = {
			id: uuidv4(),
			role: "function" as const,
			attachments: [] as Attachment[],
			content: {
				type: "functionResult" as const,
				value: {
					name: "perform_web_search",
					result: `{webSearchResults: ${JSON.stringify(results)}}`,
				} as FunctionResult,
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
		chat.messages.push(functionMessage);

		const finalAssistantMessage = await this.chatCompletionService
			.generateAssistantMessageAsync(chat.messages);

		await postToConnectionAsync(connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId: chat.chatId,
				message: updatedAssistantMessage,
				isLastSegment: false,
			} as AssistantMessageSegmentPayload,
		});

		await Promise.all([
			postToConnectionAsync(connectionId, {
				type: "assistantMessageSegment",
				payload: {
					chatId: chat.chatId,
					message: finalAssistantMessage,
					isLastSegment: true,
				} as AssistantMessageSegmentPayload,
			}),

			this.processAssistantVoiceAsync(
				connectionId, chat, finalAssistantMessage
			),
		]);

		chat.messages.push(finalAssistantMessage);
	}

	private async processAssistantVoiceAsync(
		connectionId: string,
		chat: Chat,
		message: ChatMessage,
	) {
		const transcript = (message
			.content
			.value as string)
			.replace(/```[\s\S]*?```/g, "");

		if (transcript.length === 0) {
			return;
		}

		const audioSegment = await this.generateAudioSegmentAsync(transcript);

		await postToConnectionAsync(connectionId, {
			type: "assistantAudioSegment",
			payload: {
				chatId: chat.chatId,
				audioSegment,
			} as AssistantAudioSegmentPayload
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

export interface AssistantAudioSegmentPayload extends BaseWebSocketMessagePayload {
	audioSegment: AudioSegment;
}

export interface AudioSegment {
	audioUrl: string;
	timestamp: number;
}

export interface AssistantMessageSegmentPayload extends BaseWebSocketMessagePayload, MessageSegment { }

export interface ProcessUserMessagePayload {
	connectionId: string;
	chatId: string;
	userId: string;
	message: ChatMessage;
}