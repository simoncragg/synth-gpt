import { v4 as uuidv4 } from "uuid";
import { buildHttpPostEvent, buildContext } from "./builders";
import { formatJSONResponse } from "@libs/api-gateway";
import { mocked } from "jest-mock";
import { main } from "@handlers/http/getChats/handler";
import { ChatRepository } from "@repositories/ChatRepository";

jest.mock("@repositories/ChatRepository");

describe("getChats", () => {
	const getChats = "getChats";
	const context = buildContext(getChats);
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
		] as ChatWithoutMessages[];

		chatRepositoryMock.prototype.getByUserIdAsync.mockResolvedValue(chats);

		const event = buildEvent(`/${getChats}`);
		const result = await main(event, context);

		expect(result.statusCode).toEqual(200);
		expect(JSON.parse(result.body)).toEqual({
			success: true,
			chats
		});
	});

	it("should return error response on failure to get chats", async () => {
		const error = new Error("An unexpected error occurred whilst processing your request");
		chatRepositoryMock.prototype.getByUserIdAsync.mockRejectedValue(error);

		const event = buildEvent(`/${getChats}`);
		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			success: false,
			error: error.message,
		}, 500));
	});

	const buildEvent = (path: string) => {
		return {
			...buildHttpPostEvent(path, {}, {}),
			queryStringParameters: { "userId": "user-123" }
		};
	};
});
