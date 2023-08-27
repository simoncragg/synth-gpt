import { v4 as uuidv4 } from "uuid";

import type { AssistantMessageSegmentPayload } from "./types";
import type { Attachment } from "../types";
import type { Chat, ChatMessage } from "../types";

import AssistantVoiceProcessor from "./AssistantVoiceProcessor";
import ChatCompletionService from "@services/ChatCompletionService";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

import type {
	FunctionResult,
	ReadingWebSearchResultsAction,
	SearchingWebAction,
	WebActivity,
	WebSearchResult,
} from "../types";

class WebActivityProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly chatCompletionService: ChatCompletionService;
	private readonly assistantVoiceProcessor: AssistantVoiceProcessor;

	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.chatCompletionService = new ChatCompletionService();
		this.assistantVoiceProcessor = new AssistantVoiceProcessor(connectionId, chat);
	}

	public async process(assistantMessage: ChatMessage): Promise<void> {

		const { searchTerm } = (assistantMessage.content.value as WebActivity);
		const { chatId, model } = this.chat;

		const webActivity = {
			...(assistantMessage.content.value as WebActivity),
			actions: [
				{
					type: "searching",
					searchTerm,
				} as SearchingWebAction
			]
		};

		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
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

		console.log("-------------------------------------------------------------------");
		console.log(searchTerm);
		console.log("-------------------------------------------------------------------");

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

		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
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

		this.chat.messages.push(updatedAssistantMessage);
		this.chat.messages.push(functionMessage);

		const finalAssistantMessage = await this.chatCompletionService
			.generateAssistantMessageAsync(model, this.chat.messages);

		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
				message: updatedAssistantMessage,
				isLastSegment: false,
			} as AssistantMessageSegmentPayload,
		});

		await Promise.all([
			postToConnectionAsync(this.connectionId, {
				type: "assistantMessageSegment",
				payload: {
					chatId,
					message: finalAssistantMessage,
					isLastSegment: true,
				} as AssistantMessageSegmentPayload,
			}),

			this.assistantVoiceProcessor.process(finalAssistantMessage),
		]);

		this.chat.messages.push(finalAssistantMessage);
	}
}

export default WebActivityProcessor;
