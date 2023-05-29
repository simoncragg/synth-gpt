import { buildHttpPostEvent, buildContext } from "./builders";
import { mocked } from "jest-mock";
import { generateChatResponseAsync } from "@clients/openaiApiClient";
import { main } from "@handlers/http/generateTitle/handler";
import ChatRepository from "@repositories/ChatRepository";

jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");

describe("generateTitle handler", () => {
	const generateTitle = "generateTitle";
	const context = buildContext(generateTitle);

	const chatId = "chat123";
	const message = "This is a test message";
	const generatedTitle = "Test title";

	const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);

	it("should generate a chat title and update the chat in the ChatRepository", async () => {
		generateChatResponseAsyncMock.mockResolvedValue({
			role: "assistant" as const,
			content: generatedTitle,
		});
		jest.spyOn(ChatRepository.prototype, "updateTitleAsync");

		const event = buildHttpPostEvent(`/${generateTitle}`, { message }, { chatId });
		const result = await main(event, context);

		expect(ChatRepository.prototype.updateTitleAsync)
			.toHaveBeenCalledWith(chatId, generatedTitle);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				chatId,
				title: generatedTitle,
				success: true,
			}),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		const errorMessage = "An unexpected error occurred whilst processing your request";
		generateChatResponseAsyncMock.mockRejectedValue(new Error(errorMessage));

		const event = buildHttpPostEvent(`/${generateTitle}`, { message }, { chatId });
		const result = await main(event, context);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: errorMessage
			}),
		});
	});
});
