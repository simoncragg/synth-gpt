import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { ChatRepository } from "../../src/repositories/ChatRepository";
import { buildHttpPostEvent, buildContext } from "./builders";
import { generateChatResponseAsync } from "../../src/proxies/openaiApiProxy";
import { formatJSONResponse } from "../../src/libs/api-gateway";
import { main } from "@functions/handleMessage/handler";
import { prePrompt } from "../../src/constants";

jest.mock("../../src/proxies/openaiApiProxy");
jest.mock("../../src/repositories/ChatRepository");

const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);
const updateItemAsyncSpy = jest.spyOn(ChatRepository.prototype, "updateItemAsync");

describe("handleMessage handler", () => {

	const chatId = uuidv4().toString();
	const handleMessage = "handleMessage";
	const context = buildContext(handleMessage);

	it("should return generated chat response message for new chat", async () => {

		const chatResponse = {
			role: "assistant" as const,
			content: "Hello there! How may I assist you today?"
		};

		generateChatResponseAsyncMock.mockResolvedValue(chatResponse);

		const body = { message: "hello" };
		const event = buildHttpPostEvent(`/${handleMessage}`, body, { id: chatId });

		const result = await main(event, context);

		expect(result).toHaveProperty("statusCode", 200);
		expect(JSON.parse(result.body).message).toEqual(chatResponse.content);
	});

	it("should add new item to chats db table", async () => {

		const userContent = "hello";

		const systemTimestamp = 1678144804170;
		const userTimestamp = 1678144804670;
		const assistantTimestamp = 1678144805170;

		const nowSpy = jest.spyOn(Date, "now");
		nowSpy.mockReturnValueOnce(systemTimestamp);
		nowSpy.mockReturnValueOnce(userTimestamp);
		nowSpy.mockReturnValueOnce(assistantTimestamp);

		const systemMessage = {
			role: "system",
			content: prePrompt,
			timestamp: systemTimestamp,
		};

		const userMessage = {
			role: "user",
			content: userContent,
			timestamp: userTimestamp,
		};

		const assistantMessage = {
			role: "assistant" as const,
			content: "Hello there! How may I assist you today?",
			timestamp: assistantTimestamp,
		};

		generateChatResponseAsyncMock.mockResolvedValue(assistantMessage);

		const body = { message: userContent };
		const event = buildHttpPostEvent(`/${handleMessage}`, body, { id: chatId });

		await main(event, context);

		expect(updateItemAsyncSpy).toHaveBeenCalledWith({
			id: event.pathParameters.id,
			messages: [systemMessage, userMessage, assistantMessage]
		});
	});

	it("should update existing item in chats db table", async () => {

		const userTimestamp = 1678144806000;
		const assistantTimestamp = 1678144807000;

		const nowSpy = jest.spyOn(Date, "now");
		nowSpy.mockReturnValueOnce(userTimestamp);
		nowSpy.mockReturnValueOnce(assistantTimestamp);

		const loadedMessages = [
			{
				role: "system" as const,
				content: prePrompt,
				timestamp: 1678144804170,
			},
			{
				role: "user" as const,
				content: "hello",
				timestamp: 1678144804670,
			},
			{
				role: "assistant" as const,
				content: "Hello there! How may I assist you today?",
				timestamp: 1678144805170,
			}
		];

		const getByIdAsyncMock = mocked(ChatRepository.prototype.getByIdAsync);
		getByIdAsyncMock.mockResolvedValue({
			id: chatId,
			messages: loadedMessages,
		});

		const assistantMessage = {
			role: "assistant" as const,
			content: [
				"As an artificial intelligence language model, I ",
				"don't have feelings in the way humans do, but ",
				"I'm always ready to assist you with any ",
				"questions or tasks you might have. ",
				"How can I help you today?"
			].join(""),
			timestamp: assistantTimestamp
		};

		generateChatResponseAsyncMock.mockResolvedValue(assistantMessage);

		const body = { message: "how are you" };
		const event = buildHttpPostEvent(`/${handleMessage}`, body, { id: chatId });

		await main(event, context);

		const expectedUserMessage =
			expect.objectContaining({
				role: "user" as const,
				content: body.message,
				timestamp: userTimestamp
			});

		const expectedMessages = expect.arrayContaining([
			...loadedMessages,
			expectedUserMessage,
			assistantMessage
		]);

		expect(updateItemAsyncSpy).toHaveBeenCalledWith({
			id: event.pathParameters.id,
			messages: expectedMessages
		});
	});

	it("should return error response on failure to generate chat response", async () => {

		const errorMessage = "An unexpected error occurred whilst processing your request";
		generateChatResponseAsyncMock.mockRejectedValue(
			new Error(errorMessage)
		);

		const body = { message: "how are you feeling?" };
		const event = buildHttpPostEvent(`/${handleMessage}`, body, { id: chatId });

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			error: errorMessage,
		}, 500));
	});
});
