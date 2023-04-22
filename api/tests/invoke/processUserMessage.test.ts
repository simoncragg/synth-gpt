import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { main } from "@invoke/processUserMessage/handler";
import { newChatText } from "../../src/constants";
import { postToConnectionAsync } from "@proxies/apiGatewayManagementApiClientProxy";
import { ChatRepository } from "@repositories/ChatRepository";
import TextToSpeechService from "@services/textToSpeechService";

jest.mock("@proxies/apiGatewayManagementApiClientProxy");
jest.mock("@proxies/openaiApiProxy");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");

const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const TextToSpeechServiceMock = mocked(TextToSpeechService);
const updateItemAsyncSpy = jest.spyOn(ChatRepository.prototype, "updateItemAsync");

describe("processUserMessage handler", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const title = newChatText;

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

		const audioUrl = "http://localhost:4569/synth-gpt-audio-dev/1681940407795.mpg";
		TextToSpeechServiceMock
			.prototype
			.generateSignedAudioUrlAsync
			.mockResolvedValue(audioUrl);

		const event = {
			connectionId,
			chatId,
			userId,
			message: {
				id: uuidv4(),
				role: "user" as const,
				content: "Write JavaScript to log \"Hello World\" to console",
				timestamp: 1234567890,
			},
		};

		await main(event, undefined, undefined);

		expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
			event.connectionId,
			{
				type: "assistantMessage",
				payload: {
					chatId,
					message: expect.objectContaining({
						id: expect.any(String),
						role: generatedResponse.role,
						content: generatedResponse.content,
						timestamp: expect.any(Number),
					}),
				},
			},
		);

		const transcript = generatedResponse.content.replace(/```[\s\S]*?```/g, "");
		expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
			event.connectionId,
			{
				type: "assistantAudio" as const,
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
		const assistantTimestamp = 1678144805170;

		const nowSpy = jest.spyOn(Date, "now");
		nowSpy.mockReturnValueOnce(userTimestamp);
		nowSpy.mockReturnValueOnce(assistantTimestamp);

		const userMessage = {
			id: uuidv4(),
			role: "user" as const,
			content: userContent,
			timestamp: userTimestamp,
		};

		const assistantResponse = {
			role: "assistant" as const,
			content: "Hello there! How may I assist you today?",
		};

		generateChatResponseAsyncMock.mockResolvedValue(assistantResponse);

		const event = {
			connectionId,
			chatId,
			userId,
			message: userMessage,
		};

		await main(event, undefined, undefined);

		expect(updateItemAsyncSpy).toHaveBeenCalledWith({
			chatId,
			title,
			userId,
			messages: [
				userMessage,
				{
					id: expect.any(String),
					role: assistantResponse.role,
					content: assistantResponse.content,
					timestamp: expect.any(Number),
				}
			],
			createdTime: expect.any(Number),
			updatedTime: expect.any(Number),
		});
	});

	it("should update existing item in chats db table", async () => {
		const createdTime = 1678144807000;
		const loadedMessages = [
			{
				id: uuidv4(),
				role: "user" as const,
				content: "hello",
				timestamp: 1678144806000,
			},
			{
				id: uuidv4(),
				role: "assistant" as const,
				content: "Hello there! How may I assist you today?",
				timestamp: createdTime,
			}
		];

		const getByChatIdAsyncMock = mocked(ChatRepository.prototype.getByChatIdAsync);
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
			content: "how are you?",
			timestamp: Date.now(),
		};

		const assistantMessage = {
			role: "assistant" as const,
			content: [
				"As an artificial intelligence language model,",
				"I don't have feelings in the way humans do, but",
				"I'm always ready to assist you with any",
				"questions or tasks you might have.",
				"How can I help you today?"
			].join(" "),
		};

		generateChatResponseAsyncMock.mockResolvedValue(assistantMessage);

		const event = {
			connectionId,
			chatId,
			userId,
			message: userMessage,
		};

		await main(event, undefined, undefined);

		expect(updateItemAsyncSpy).toHaveBeenCalledWith({
			chatId,
			title,
			userId,
			messages: [
				loadedMessages[0],
				loadedMessages[1],
				userMessage,
				{
					id: expect.any(String),
					role: "assistant" as const,
					content: assistantMessage.content,
					timestamp: expect.any(Number),
				},
			],
			createdTime,
			updatedTime: expect.any(Number),
		});
	});
});
