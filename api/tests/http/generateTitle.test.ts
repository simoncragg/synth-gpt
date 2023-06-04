import { mocked } from "jest-mock";

import ChatRepository from "@repositories/ChatRepository";
import { buildContext, buildHttpPostEvent } from "./builders";
import { generateChatResponseAsync } from "@clients/openaiApiClient";
import { generateTitle } from "@handlers/http/generateTitle/handler";

jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");

describe("generateTitle handler", () => {
	const chatId = "chat123";
	const message = "This is a test message";
	const generatedTitle = "Test title";
	const context = buildContext("generateTitle");
	const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);

	type GenerateTitleRequestBody = {
		message: string;
	};

	it("should generate a chat title and update the chat in the ChatRepository", async () => {
		generateChatResponseAsyncMock.mockResolvedValue({
			role: "assistant" as const,
			content: generatedTitle,
		});

		const event = buildHttpPostEvent<GenerateTitleRequestBody>(`/chats/${chatId}/generateTitle`, { message }, { chatId });
		const result = await generateTitle(event, context, null);

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

		const event = buildHttpPostEvent<GenerateTitleRequestBody>(`/chat/${chatId}/generateTitle`, { message }, { chatId });
		const result = await generateTitle(event, context, null);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: errorMessage
			}),
		});
	});
});
