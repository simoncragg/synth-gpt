import { buildHttpPostEvent, buildContext } from "./builders";
import { mocked } from "jest-mock";
import { generateChatResponseAsync } from "../../src/proxies/openaiApiProxy";
import { ChatRepository } from "../../src/repositories/ChatRepository";
import { main } from "@functions/generateTitle/handler";

jest.mock("../../src/repositories/ChatRepository");
jest.mock("../../src/proxies/openaiApiProxy");

describe("generateTitle handler", () => {
	const generateTitle = "generateTitle";
	const context = buildContext(generateTitle);

	const chatId = "chat123";
	const message = "This is a test message";
	const generatedTitle = "Test title";

	const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);

	it("should generate a chat title and update the chat in the ChatRepository", async () => {
		// Arrange
		generateChatResponseAsyncMock.mockResolvedValue({
			role: "assistant" as const,
			content: generatedTitle,
		});

		jest.spyOn(ChatRepository.prototype, "updateTitleAsync");

		// Act
		const event = buildHttpPostEvent(`/${generateTitle}`, { message }, { chatId });
		const result = await main(event, context);

		// Assert
		expect(ChatRepository.prototype.updateTitleAsync)
			.toHaveBeenCalledWith(chatId, generatedTitle, expect.any(Number));

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({ chatId, title: generatedTitle }),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		// Arrange
		const errorMessage = "An unexpected error occurred whilst processing your request";
		generateChatResponseAsyncMock.mockRejectedValue(new Error(errorMessage));

		// Act
		const event = buildHttpPostEvent(`/${generateTitle}`, { message }, { chatId });
		const result = await main(event, context);

		// Assert
		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({ error: errorMessage }),
		});
	});
});
