import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { main } from "@invoke/processUserMessage/handler";
import { newChatText } from "../../src/constants";
import { postToConnectionAsync } from "@proxies/apiGatewayManagementApiClientProxy";
import { ChatRepository } from "@repositories/ChatRepository";

jest.mock("@proxies/apiGatewayManagementApiClientProxy");
jest.mock("@proxies/openaiApiProxy");
jest.mock("@repositories/ChatRepository");

const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const updateItemAsyncSpy = jest.spyOn(ChatRepository.prototype, "updateItemAsync");

describe("processUserMessage handler", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const title = newChatText;

	it("should post generated chat response message for new chat", async () => {
		const generatedResponse = {
			role: "assistant" as const,
			content: "Hello there! How may I assist you today?"
		};

		generateChatResponseAsyncMock.mockResolvedValue(generatedResponse);

		const event = {
			connectionId,
			chatId,
			userId,
			message: {
				id: uuidv4(),
				role: "user" as const,
				content: "test message content",
				timestamp: 1234567890,
			},
		};

		await main(event, undefined, undefined);

		expect(postToConnectionAsyncMock).toHaveBeenCalledWith(
			event.connectionId,
			{
				chatId: event.chatId,
				message: expect.objectContaining({
					id: expect.any(String),
					role: generatedResponse.role,
					content: generatedResponse.content,
					timestamp: expect.any(Number),
				}),
			}
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
