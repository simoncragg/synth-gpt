import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import ChatRepository from "@repositories/ChatRepository";
import { buildHttpGetEvent } from "./builders";
import { getChat } from "@handlers/http/getChat/handler";

jest.mock("@repositories/ChatRepository");

describe("getChat", () => {
	const chatId = uuidv4();
	const chatRepositoryMock = mocked(ChatRepository);

	it("should return chat when successful", async () => {
		const chat = {
			chatId,
			title: "Chat 1",
			userId: "user-123",
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
		} as Chat;

		chatRepositoryMock.prototype.getByChatIdAsync.mockResolvedValue(chat);

		const event = buildHttpGetEvent("/chat/", { chatId });
		const result = await getChat(event);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				chat,
				success: true,
			})
		});
	});

	it("should return error response on failure to get chat", async () => {
		const error = new Error("An unexpected error occurred whilst processing your request");
		chatRepositoryMock.prototype.getByChatIdAsync.mockRejectedValue(error);

		const event = buildHttpGetEvent("/chat", { chatId }, {});
		const result = await getChat(event);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: error.message,
			})
		});
	});
});
