import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import ChatRepository from "@repositories/ChatRepository";
import { buildHttpGetEvent } from "../builders";
import { getChats } from "@handlers/http/getChats/handler";

jest.mock("@repositories/ChatRepository");

describe("getChats", () => {
	const chatRepositoryMock = mocked(ChatRepository);

	it("should return an array of chats when successful", async () => {
		const chats = [
			{
				chatId: uuidv4(),
				title: "Chat 1",
				userId: "user-123",
				createdTime: Date.now(),
				updatedTime: Date.now(),
			}
		];

		chatRepositoryMock.prototype.getByUserIdAsync.mockResolvedValue(chats);

		const event = buildHttpGetEvent("/chats", {}, { "userId": "user-123" });
		const result = await getChats(event);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				chats,
				success: true,
			})
		});
	});

	it("should return error response on failure to get chats", async () => {
		const error = new Error("An unexpected error occurred whilst processing your request");
		chatRepositoryMock.prototype.getByUserIdAsync.mockRejectedValue(error);

		const event = buildHttpGetEvent("/chats", {}, { "userId": "user-123" });
		const result = await getChats(event);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: error.message,
			})
		});
	});
});
