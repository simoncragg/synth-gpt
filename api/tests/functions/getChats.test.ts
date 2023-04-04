import { v4 as uuidv4 } from "uuid";
import { buildHttpPostEvent, buildContext } from "./builders";
import { formatJSONResponse } from "@libs/api-gateway";
import { mocked } from "jest-mock";
import { main } from "../../src/functions/getChats/handler";
import { ChatRepository } from "../../src/repositories/ChatRepository";

jest.mock("../../src/repositories/ChatRepository");

describe("getChats", () => {
	const getChats = "getChats";
	const context = buildContext(getChats);
	const chatRepositoryMock = mocked(ChatRepository);

	it("should return an array of chats when successful", async () => {
		// Arrange
		const chats = [
			{
				chatId: uuidv4(),
				title: "Chat 1",
				userId: "user-123",
				createdTime: Date.now(),
				updatedTime: Date.now(),
			}
		] as ChatWithoutMessages[];

		chatRepositoryMock.prototype.getByUserIdAsync.mockResolvedValue(chats);

		// Act
		const event = buildHttpPostEvent(`/${getChats}`, {}, {});
		const result = await main(event, context);

		// Assert
		expect(result.statusCode).toEqual(200);
		expect(JSON.parse(result.body)).toEqual(chats);
	});

	it("should return error response on failure to get chats", async () => {
		// Arrange
		const error = new Error("An unexpected error occurred whilst processing your request");
		chatRepositoryMock.prototype.getByUserIdAsync.mockRejectedValue(error);

		// Act
		const event = buildHttpPostEvent(`/${getChats}`, {}, {});
		const result = await main(event, context);

		// Assert
		expect(result).toEqual(formatJSONResponse({
			error: error.message,
		}, 500));
	});
});
