import { v4 as uuidv4 } from "uuid";
import { buildHttpPostEvent, buildContext } from "./builders";
import { formatJSONResponse } from "@libs/api-gateway";
import { mocked } from "jest-mock";
import { main } from "../../src/functions/getChat/handler";
import { ChatRepository } from "../../src/repositories/ChatRepository";

jest.mock("../../src/repositories/ChatRepository");

describe("getChat", () => {
	const getChat = "getChat";
	const context = buildContext(getChat);
	const chatRepositoryMock = mocked(ChatRepository);

	it("should return chat when successful", async () => {
		// Arrange
		const chat = {
			chatId: uuidv4(),
			title: "Chat 1",
			userId: "user-123",
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
		} as Chat;

		chatRepositoryMock.prototype.getByChatIdAsync.mockResolvedValue(chat);

		// Act
		const event = buildHttpPostEvent(`/${getChat}`, {}, {});
		const result = await main(event, context);

		// Assert
		expect(result.statusCode).toEqual(200);
		expect(JSON.parse(result.body)).toEqual(chat);
	});

	it("should return error response on failure to get chat", async () => {
		// Arrange
		const error = new Error("An unexpected error occurred whilst processing your request");
		chatRepositoryMock.prototype.getByChatIdAsync.mockRejectedValue(error);

		// Act
		const event = buildHttpPostEvent(`/${getChat}`, {}, {});
		const result = await main(event, context);

		// Assert
		expect(result).toEqual(formatJSONResponse({
			error: error.message,
		}, 500));
	});
});
