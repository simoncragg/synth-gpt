import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type {
	ReadingWebSearchResultsAction,
	SearchingWebAction,
	WebActivity,
	WebSearchResult,
} from "@src/types";

import type { Delta } from "@clients/openaiApiClient";

import type {
	WebPage,
	WebPages,
	WebSearchResponse,
} from "@clients/bingSearchApiClient";

import type {
	ProcessUserMessagePayload,
} from "@services/UserMessageProcessor";

import ChatRepository from "@repositories/ChatRepository";
import PostToConnectionMockUtility from "./utils/PostToConnectionMockUtility";
import TextToSpeechService from "@services/TextToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";
import { arrangeTextToSpeechServiceMock } from "./utils/arrangeTextToSpeechServiceMock";
import { generateChatResponseAsync, generateChatResponseDeltasAsync } from "@clients/openaiApiClient";
import { newChatText } from "@src/constants";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { tokenizeAndDecodeChunks } from "./utils/tokenizeAndDecodeChunks";

jest.mock("@clients/apiGatewayManagementApiClient");
jest.mock("@clients/bingSearchApiClient");
jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");

const performWebSearchAsyncMock = mocked(performWebSearchAsync);
const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const generateChatResponseDeltasAsyncMock = mocked(generateChatResponseDeltasAsync);
const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const TextToSpeechServiceMock = mocked(TextToSpeechService);

const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const postToConnectionMockUtility = new PostToConnectionMockUtility(postToConnectionAsyncMock);

describe("UserMessageProcessor: Web Search response", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const model = "gpt-3.5-turbo";
	const title = newChatText;
	const searchTerm = "Wimbledon 2023 start date";
	const assistantAnswer = "According to my search results, Wimbledon 2023 will start on Monday, July 3rd, 2023 and will end on Sunday, July 16th, 2023.";

	let userMessageProcessor: UserMessageProcessor;
	let userMessagePayload: ProcessUserMessagePayload;
	let webSearchResponse: WebSearchResponse;

	beforeEach(() => {
		userMessagePayload = {
			connectionId,
			chatId,
			userId,
			model,
			message: {
				id: uuidv4(),
				role: "user",
				attachments: [],
				content: {
					type: "text",
					value: "When does Wimbledon start this year?",
				},
				timestamp: Date.now(),
			},
		};

		webSearchResponse = buildWebSearchResponse();
		userMessageProcessor = new UserMessageProcessor();

		arrangeGenerateChatResponseDeltasAsyncMock(searchTerm);
		arrangeGenerateChatResponseAsyncMock(assistantAnswer);
		arrangePerformWebSearchAsyncMock(webSearchResponse);
		arrangeTextToSpeechServiceMock(TextToSpeechServiceMock);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should post web activity messages to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		const webActivity = {
			searchTerm,
			currentState: "searching",
			actions: [{
				type: "searching",
				searchTerm,
			} as SearchingWebAction],
		} as WebActivity;

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "webActivity",
				value: webActivity,
			},
			userMessagePayload
		);

		const { webPages } = webSearchResponse;
		const results = webPages.value.map(({ name, url, isFamilyFriendly, snippet }) => ({
			name,
			url,
			isFamilyFriendly,
			snippet
		} as WebSearchResult));

		const readingResultsAction = {
			type: "readingResults",
			results,
		} as ReadingWebSearchResultsAction;

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "webActivity",
				value: {
					...webActivity,
					currentState: "readingResults",
					actions: expect.arrayContaining([
						...webActivity.actions,
						readingResultsAction
					]),
				},
			},
			userMessagePayload
		);

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "webActivity",
				value: {
					...webActivity,
					currentState: "finished",
					actions: [
						...webActivity.actions,
						readingResultsAction
					],
				},
			},
			userMessagePayload
		);
	});

	it("should post audio to client", async () => {
		await userMessageProcessor.process(userMessagePayload);
		postToConnectionMockUtility.expectAudioMessageSegmentToBePostedToClient(assistantAnswer, userMessagePayload);
	});

	it("should update chat database", async () => {
		await userMessageProcessor.process(userMessagePayload);

		expect(updateItemAsyncMock).toHaveBeenCalledWith(
			expect.objectContaining({
				chatId,
				title,
				userId,
				model,
				messages: expect.arrayContaining([
					expect.objectContaining({
						...userMessagePayload.message,
						timestamp: expect.any(Number),
					}),
				]),
			}),
		);

		const webActivity = {
			searchTerm,
			currentState: "searching",
			actions: [{
				type: "searching",
				searchTerm,
			} as SearchingWebAction],
		} as WebActivity;

		const { webPages } = webSearchResponse;
		const results = webPages.value.map(({ name, url, isFamilyFriendly, snippet }) => ({
			name,
			url,
			isFamilyFriendly,
			snippet
		} as WebSearchResult));

		expect(updateItemAsyncMock).toHaveBeenCalledWith(
			{
				chatId,
				title,
				userId,
				model,
				messages: [
					{
						...userMessagePayload.message,
						timestamp: expect.any(Number),
					},
					{
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						content: {
							type: "webActivity",
							value: {
								...webActivity,
								currentState: "finished",
								actions: expect.arrayContaining([
									...webActivity.actions,
									{
										type: "readingResults",
										results,
									} as ReadingWebSearchResultsAction,
								]),
							},
						},
						timestamp: expect.any(Number),
					},
					{
						id: expect.any(String),
						role: "function",
						attachments: [],
						content: {
							type: "functionResult",
							value: {
								name: "perform_web_search",
								result: `{webSearchResults: ${JSON.stringify(results)}}`
							}
						},
						timestamp: expect.any(Number),
					},
					{
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						content: {
							type: "text",
							value: assistantAnswer
						},
						timestamp: expect.any(Number),
					}
				],
				createdTime: expect.any(Number),
				updatedTime: expect.any(Number),
			}
		);
	});

	const buildWebSearchResponse = (): WebSearchResponse => {
		return {
			queryContext: {
				originalQuery: "Wimbledon start date 2023"
			},
			webPages: {
				webSearchUrl: "https://www.bing.com/search?q=Wimbledon+start+date+2023",
				totalEatches: 18100000,
				value: [
					{
						id: "https://api.bing.microsoft.com/api/v7/#WebPages.0",
						name: "When is Wimbledon 2023? Dates, times and ticket ballot",
						url: "https://www.radiotimes.com/tv/sport/tennis/wimbledon-2023-date/",
						isFamilyFriendly: true,
						displayUrl: "https://www.radiotimes.com/tv/sport/tennis/wimbledon-2023-date",
						snippet: "Wimbledon 2023 will begin on Monday 3rd July 2023 and run until the men's singles final on ...",
						dateLastCrawled: "2023-04-30T07: 07: 00.0000000Z",
						language: "en",
						isNavigational: false
					},
				] as WebPage[]
			} as WebPages
		} as WebSearchResponse;
	};

	const arrangeGenerateChatResponseAsyncMock = (content: string) => {
		generateChatResponseAsyncMock.mockResolvedValueOnce({
			role: "assistant",
			content,
		});
	};
		
	const arrangeGenerateChatResponseDeltasAsyncMock = (searchTerm: string) => {
		generateChatResponseDeltasAsyncMock.mockImplementation(async (
			_,
			onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
		): Promise<void> => {
		
			await onDeltaReceived({
				function_call: {
					name: "perform_web_search",
					arguments: "",
				},
			}, null);
		
			for (const chunk of tokenizeAndDecodeChunks(`{ "search_term": "${searchTerm}" }`)) {
				await onDeltaReceived({
					function_call: {
						name: "perform_web_search",
						arguments: chunk
					},
				}, null);
			}
			await onDeltaReceived({}, "function_call");
		});
	};
		
	const arrangePerformWebSearchAsyncMock = (webSearchResponse: WebSearchResponse) => {
		performWebSearchAsyncMock.mockResolvedValue(webSearchResponse);
	};
});
