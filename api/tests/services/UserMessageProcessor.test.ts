import tiktoken from "tiktoken-node";
import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type {
	ChatMessage,
	Content,
	ReadingWebSearchResultsAction,
	SearchingWebAction,
	WebActivity,
	WebSearchResult,
} from "../../src/types";

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
import TextToSpeechService from "@services/TextToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import {
	generateChatResponseAsync,
	generateChatResponseDeltasAsync,
} from "@clients/openaiApiClient";
import { newChatText } from "../../src/constants";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

jest.mock("@clients/apiGatewayManagementApiClient");
jest.mock("@clients/bingSearchApiClient");
jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");

const performWebSearchAsyncMock = mocked(performWebSearchAsync);
const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const generateChatResponseDeltasAsyncMock = mocked(generateChatResponseDeltasAsync);
const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const TextToSpeechServiceMock = mocked(TextToSpeechService);

describe("UserMessageProcessor", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const title = newChatText;
	const baseAudioUrl = "http://localhost:4569/synth-gpt-audio-dev/";
	const model = "gpt-3.5-turbo";

	let userMessageProcessor: UserMessageProcessor;

	describe("Process a user message with a complex multipe code block response", () => {
		const generatedLines = [
			{
				line: "Sure, here's a two-line Python code to calculate the sum of even numbers from 1 to 10:\n",
				isSpoken: true,
			},
			{
				line: "```python \n",
				isSpoken: false,
			},
			{
				line: "even_sum = sum(range(2, 11, 2))\n",
				isSpoken: false,
			},
			{
				line: "print(even_sum)\n",
				isSpoken: false,
			},
			{
				line: "```\n",
				isSpoken: false,
			},
			{
				line: "Expected output:\n",
				isSpoken: true,
			},
			{
				line: "```bash 30```\n",
				isSpoken: false,
			},
			{
				line: "The provided Python code calculates and prints the sum of even numbers from 1 to 10, resulting in an expected output of 30.\n",
				isSpoken: true,
			}
		];

		let userMessage: ChatMessage;
		let userMessagePayload: ProcessUserMessagePayload;

		beforeEach(() => {
			arrangeGenerateChatResponseDeltasAsyncMock(generatedLines.map(x => x.line));
			arrangeTextToSpeechServiceMock();

			userMessage = {
				id: uuidv4(),
				role: "user",
				attachments: [],
				content: {
					type: "text",
					value: "Calculate the sum of even numbers from 1 to 10 using 2 lines of Python and show the expected output",
				},
				timestamp: 1234567890,
			};

			userMessagePayload = {
				connectionId,
				chatId,
				userId,
				model,
				message: userMessage,
			};

			userMessageProcessor = new UserMessageProcessor();
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it("should post assistantMessage messages to client", async () => {
			await userMessageProcessor.process(userMessagePayload);

			for (const line of generatedLines.map(x => x.line)) {
				expectAssistantMessageSegmentToBePostedToClient(
					{
						type: "text",
						value: line,
					},
					userMessagePayload,
				);
			}
		});

		it("should post correct assistantAudio messages to client", async () => {
			await userMessageProcessor.process(userMessagePayload);

			const spokenLines = generatedLines
				.filter(x => x.isSpoken)
				.map(x => x.line);

			for (const transcript of spokenLines) {
				expectAudioMessageSegmentToBePostedToClient(transcript, userMessagePayload);
			}

			const unspokenLines = generatedLines
				.filter(x => x.isSpoken === false)
				.map(x => x.line);

			for (const transcript of unspokenLines) {
				expectAudioMessageSegmentNotToBePostedToClient(transcript, userMessagePayload);
			}
		});

		it("should update the chat database", async () => {
			await userMessageProcessor.process(userMessagePayload);

			expect(updateItemAsyncMock).toHaveBeenCalledWith(
				expect.objectContaining({
					chatId,
					title,
					userId,
					messages: [
						userMessage,
						{
							id: expect.any(String),
							role: "assistant",
							attachments: [],
							content: {
								type: "text",
								value: generatedLines.map(x => x.line).join(""),
							},
							timestamp: expect.any(Number),
						}
					],
					createdTime: expect.any(Number),
					updatedTime: expect.any(Number),
				}));
		});

		describe("Process a user message using a web search", () => {
			const searchTerm = "Wimbledon 2023 start date";
			const assistantAnswer = "According to my search results, Wimbledon 2023 will start on Monday, July 3rd, 2023 and will end on Sunday, July 16th, 2023.";

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

				arrangeGenerateChatResponseDeltasAsyncMockWithSearchTerm(searchTerm);
				arrangeGenerateChatResponseAsyncMock(assistantAnswer);
				arrangePerformWebSearchAsyncMock(webSearchResponse);
				arrangeTextToSpeechServiceMock();
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

				expectAssistantMessageSegmentToBePostedToClient(
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

				expectAssistantMessageSegmentToBePostedToClient(
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

				expectAssistantMessageSegmentToBePostedToClient(
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
				expectAudioMessageSegmentToBePostedToClient(assistantAnswer, userMessagePayload);
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
								snippet: "Wimbledon 2023 will begin on Monday 3rd July 2023 and run until the men's singles final on Sunday 16th July 2023. As ever, the classic two-week format will return, but the tournament will...",
								dateLastCrawled: "2023-04-30T07: 07: 00.0000000Z",
								language: "en",
								isNavigational: false
							},
						] as WebPage[]
					} as WebPages
				} as WebSearchResponse;
			};
		});
	});

	const arrangeGenerateChatResponseAsyncMock = (content: string) => {
		generateChatResponseAsyncMock.mockResolvedValueOnce({
			role: "assistant",
			content,
		});
	};

	const arrangeGenerateChatResponseDeltasAsyncMock = (lines: string[]) => {
		generateChatResponseDeltasAsyncMock.mockImplementation(async (
			_,
			onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
		): Promise<void> => {
			for (const line of lines) {
				const chunks = tokenizeAndDecodeChunks(line);
				for (const chunk of chunks) {
					await onDeltaReceived({ content: chunk }, null);
				}
				await onDeltaReceived({}, "stop");
			}
		});
	};

	const arrangeGenerateChatResponseDeltasAsyncMockWithSearchTerm = (searchTerm: string) => {
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

	const arrangeTextToSpeechServiceMock = () => {
		TextToSpeechServiceMock
			.prototype
			.generateSignedAudioUrlAsync
			.mockImplementation((transcript) =>
				Promise.resolve(baseAudioUrl + encodeURIComponent(transcript) + ".mpg")
			);
	};

	const expectAssistantMessageSegmentToBePostedToClient = (
		content: Content,
		userMessagePayload: ProcessUserMessagePayload,
		isLastSegment = false
	) => {
		expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
			userMessagePayload.connectionId,
			{
				type: "assistantMessageSegment",
				payload: {
					chatId: userMessagePayload.chatId,
					message: {
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						content,
						timestamp: expect.any(Number),
					},
					isLastSegment,
				},
			},
		);
	};

	const expectAudioMessageSegmentToBePostedToClient = (
		transcript: string,
		userMessagePayload: ProcessUserMessagePayload
	) => {
		const { connectionId, chatId } = userMessagePayload;
		expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: baseAudioUrl + encodeURIComponent(transcript) + ".mpg",
						timestamp: expect.any(Number),
					},
				},
			},
		);
	};

	const expectAudioMessageSegmentNotToBePostedToClient = (
		transcript: string,
		userMessagePayload: ProcessUserMessagePayload
	) => {
		const { connectionId, chatId } = userMessagePayload;
		expect(postToConnectionAsyncMock).not.toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: baseAudioUrl + encodeURIComponent(transcript) + ".mpg",
						timestamp: expect.any(Number),
					},
				},
			},
		);
	};

	const tokenizeAndDecodeChunks = (str: string): string[] => {
		const tokenizer = tiktoken.getEncoding("cl100k_base");
		const output = tokenizer.encode(str).map(token => tokenizer.decode([token]));

		console.log(output.join("").replace(" ", "*"));
		return output;
	};
});
