import type { AssistantMessageSegmentPayload } from "./types";
import type { Chat, ChatMessage } from "../types";

import type {
	ReadingWebSearchResultsAction,
	SearchingWebAction,
	WebActivity,
	WebSearchResult,
} from "../types";

import AssistantMessageProcessor from "./AssistantMessageProcessor";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

class WebActivityProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;

	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
	}

	public async process(assistantMessage: ChatMessage): Promise<void> {

		const { searchTerm } = (assistantMessage.content.value as WebActivity);
		const { chatId } = this.chat;

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

		const finishedMessage = {
			...assistantMessage,
			content: {
				type: "webActivity",
				value: {
					searchTerm,
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

		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId,
				message: finishedMessage,
				isLastSegment: false,
			} as AssistantMessageSegmentPayload
		});
	
		this.chat.messages.push(finishedMessage);

		await new AssistantMessageProcessor(this.connectionId, this.chat).process();
	}
}

export default WebActivityProcessor;
