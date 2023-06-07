import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import ChatRepository from "@repositories/ChatRepository";
import { buildHttpDeleteEvent } from "./builders";
import { deleteChat } from "@handlers/http/deleteChat/handler";

jest.mock("@repositories/ChatRepository");

describe("deleteChat handler", () => {
	const chatId = uuidv4();
	const chatRepositoryMock = mocked(ChatRepository);

	it("should successfully deleted chat for given chatId", async () => {
		const event = buildHttpDeleteEvent(`/chats/${chatId}`, {}, { chatId });
		const result = await deleteChat(event);

		expect(ChatRepository.prototype.deleteByChatIdAsync)
			.toHaveBeenCalledWith(chatId);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				success: true
			}),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		const errorMessage = "An unexpected error occurred whilst processing your request";
		chatRepositoryMock.prototype.deleteByChatIdAsync.mockRejectedValue(new Error(errorMessage));

		const event = buildHttpDeleteEvent(`/chats/${chatId}`, {}, { chatId });
		const result = await deleteChat(event);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: errorMessage
			}),
		});
	});
});
