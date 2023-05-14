import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { performWebSearchAsync } from "@clients/bingSearchApiClient";
import { generateChatResponseAsync } from "@clients/openaiApiClient";
import { newChatText } from "../../src/constants";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { ChatRepository } from "@repositories/ChatRepository";
import TextToSpeechService from "@services/textToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";

jest.mock("@clients/apiGatewayManagementApiClient");
jest.mock("@clients/bingSearchApiClient");
jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");

const performWebSearchAsyncMock = mocked(performWebSearchAsync);
const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const TextToSpeechServiceMock = mocked(TextToSpeechService);
const ChatRepositoryMock = mocked(ChatRepository);
const updateItemAsyncMock = mocked(ChatRepositoryMock.prototype.updateItemAsync);

describe("UserMessageProcessor", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const title = newChatText;
	const audioUrl = "http://localhost:4569/synth-gpt-audio-dev/1681940407795.mpg";

	const userMessageProcessor = new UserMessageProcessor();

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("Process simple message", () => {

		it("should post assistantMessage and assistantAudio messages to client", async () => {
			const generatedResponse = {
				role: "assistant" as const,
				content: [
					"Sure, here's the JavaScript code to log \"Hello World\" to the console:",
					"```javascript",
					"console.log(\"Hello World\");",
					"```",
					"When you run this code, it will output \"Hello World\" in the console."
				].join("\n"),
			};

			generateChatResponseAsyncMock.mockResolvedValue(generatedResponse);

			TextToSpeechServiceMock
				.prototype
				.generateSignedAudioUrlAsync
				.mockResolvedValue(audioUrl);

			const userMessagePayload = {
				connectionId,
				chatId,
				userId,
				message: {
					id: uuidv4(),
					role: "user" as const,
					content: {
						type: "text" as const,
						value: "Write JavaScript to log \"Hello World\" to console",
					},
					timestamp: 1234567890,
				},
			};

			await userMessageProcessor.process(userMessagePayload);

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantMessage",
					payload: {
						chatId,
						message: expect.objectContaining({
							id: expect.any(String),
							role: generatedResponse.role,
							content: {
								type: "text",
								value: generatedResponse.content,
							},
							timestamp: expect.any(Number),
						}),
					},
				},
			);

			const transcript = generatedResponse.content.replace(/```[\s\S]*?```/g, "");
			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantAudio",
					payload: {
						chatId,
						transcript,
						audioUrl,
					},
				},
			);
		});

		it("should add new item to chats db table", async () => {
			const userContent = "hello";
			const userTimestamp = 1678144804670;

			const userMessage = {
				id: uuidv4(),
				role: "user" as const,
				content: {
					type: "text" as const,
					value: userContent,
				},
				timestamp: userTimestamp,
			};

			const assistantResponse = {
				role: "assistant" as const,
				content: "Hello there! How may I assist you today?",
			};

			generateChatResponseAsyncMock.mockResolvedValue(assistantResponse);

			const userMessagePayload = {
				connectionId,
				chatId,
				userId,
				message: userMessage,
			};

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
							role: assistantResponse.role,
							content: {
								type: "text",
								value: assistantResponse.content,
							},
							timestamp: expect.any(Number),
						}
					],
					createdTime: expect.any(Number),
					updatedTime: expect.any(Number),
				}));
		});

		it("should update existing item in chats db table", async () => {
			const createdTime = 1678144807000;
			const loadedMessages = [
				{
					id: uuidv4(),
					role: "user" as const,
					content: {
						type: "text" as const,
						value: "hello",
					},
					timestamp: 1678144806000,
				},
				{
					id: uuidv4(),
					role: "assistant" as const,
					content: {
						type: "text" as const,
						value: "Hello there! How may I assist you today?",
					},
					timestamp: createdTime,
				}
			];

			const getByChatIdAsyncMock = mocked(ChatRepositoryMock.prototype.getByChatIdAsync);
			getByChatIdAsyncMock.mockResolvedValue({
				chatId,
				title,
				userId,
				messages: loadedMessages,
				createdTime,
				updatedTime: createdTime,
			});

			const userMessage = {
				id: uuidv4(),
				role: "user" as const,
				content: {
					type: "text" as const,
					value: "how are you?",
				},
				timestamp: Date.now(),
			};

			const assistantMessage = {
				role: "assistant" as const,
				content: "As an artificial intelligence language model... How can I help you today?",
			};

			generateChatResponseAsyncMock.mockResolvedValue(assistantMessage);

			const userMessagePayload = {
				connectionId,
				chatId,
				userId,
				message: userMessage,
			};

			await userMessageProcessor.process(userMessagePayload);

			expect(updateItemAsyncMock).toHaveBeenCalledWith({
				chatId,
				title,
				userId,
				messages: [
					loadedMessages[0],
					loadedMessages[1],
					userMessage,
					{
						id: expect.any(String),
						role: "assistant",
						content: {
							type: "text",
							value: assistantMessage.content,
						},
						timestamp: expect.any(Number),
					},
				],
				createdTime,
				updatedTime: expect.any(Number),
			});
		});
	});

	describe("process web search", () => {

		const searchTerm = "Wimbledon 2023 start date";
		const searchResults = {
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

		const assistantAnswer = "According to my search results, Wimbledon 2023 will start on Monday, July 3rd, 2023 and will end on Sunday, July 16th, 2023.";

		it("should post web activity messages to client", async () => {

			arrangeMocksForWebSearch(
				searchTerm,
				searchResults,
				assistantAnswer
			);

			const userMessagePayload = buildUserMessagePayloadForWebSearchTest();
			await userMessageProcessor.process(userMessagePayload);

			const webActivity = {
				searchTerm,
				currentState: "searching",
				actions: [{
					type: "searching",
					searchTerm,
				} as SearchingWebAction],
			} as WebActivity;

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantMessage",
					payload: {
						chatId,
						message: expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
							content: {
								type: "webActivity",
								value: webActivity,
							},
							timestamp: expect.any(Number),
						}),
					},
				},
			);

			const { webPages } = searchResults;
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

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantMessage",
					payload: {
						chatId,
						message: expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
							content: {
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
							timestamp: expect.any(Number),
						}),
					},
				},
			);

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantMessage",
					payload: {
						chatId,
						message: expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
							content: {
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
							timestamp: expect.any(Number),
						}),
					},
				},
			);
		});

		it("should post test response and assistant audio to client", async () => {
			arrangeMocksForWebSearch(
				searchTerm,
				searchResults,
				assistantAnswer
			);

			const userMessagePayload = buildUserMessagePayloadForWebSearchTest();
			await userMessageProcessor.process(userMessagePayload);

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantMessage",
					payload: {
						chatId,
						message: expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
							content: {
								type: "text",
								value: assistantAnswer,
							},
							timestamp: expect.any(Number),
						}),
					},
				},
			);

			expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
				userMessagePayload.connectionId,
				{
					type: "assistantAudio",
					payload: {
						chatId,
						transcript: assistantAnswer,
						audioUrl,
					},
				},
			);
		});

		it("should update chat database", async () => {
			arrangeMocksForWebSearch(
				searchTerm,
				searchResults,
				assistantAnswer
			);

			const userMessagePayload = buildUserMessagePayloadForWebSearchTest();
			await userMessageProcessor.process(userMessagePayload);

			expect(updateItemAsyncMock).toHaveBeenCalledWith(
				expect.objectContaining({
					chatId,
					title,
					userId,
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

			const { webPages } = searchResults;
			const results = webPages.value.map(({ name, url, isFamilyFriendly, snippet }) => ({
				name,
				url,
				isFamilyFriendly,
				snippet
			} as WebSearchResult));

			expect(updateItemAsyncMock).toHaveBeenCalledWith(
				expect.objectContaining({
					chatId,
					title,
					userId,
					messages: expect.arrayContaining([
						expect.objectContaining({
							...userMessagePayload.message,
							timestamp: expect.any(Number),
						}),
						expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
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
						}),
						expect.objectContaining({
							id: expect.any(String),
							role: "user",
							content: {
								type: "text",
								value: `\`\`\`json\n{webSearchResults: ${JSON.stringify(results)}}\n\`\`\``
							},
							timestamp: expect.any(Number),
						}),
						expect.objectContaining({
							id: expect.any(String),
							role: "assistant",
							content: {
								type: "text",
								value: assistantAnswer
							},
							timestamp: expect.any(Number),
						})
					]),
					createdTime: expect.any(Number),
					updatedTime: expect.any(Number),
				})
			);
		});

		const buildUserMessagePayloadForWebSearchTest = () => {
			return {
				connectionId,
				chatId,
				userId,
				message: {
					id: uuidv4(),
					role: "user" as const,
					content: {
						type: "text" as const,
						value: "When does Wimbledon start this year?",
					},
					timestamp: Date.now(),
				},
			};
		};

		const arrangeMocksForWebSearch = (
			searchTerm: string,
			searchResults: WebSearchResponse,
			assistantAnswer: string
		) => {
			generateChatResponseAsyncMock.mockResolvedValueOnce({
				role: "assistant",
				content: `SEARCH: "${searchTerm}"`,
			});

			generateChatResponseAsyncMock.mockResolvedValueOnce({
				role: "assistant",
				content: assistantAnswer,
			});

			performWebSearchAsyncMock.mockResolvedValue(searchResults);

			TextToSpeechServiceMock
				.prototype
				.generateSignedAudioUrlAsync
				.mockResolvedValue(audioUrl);
		};
	});
});