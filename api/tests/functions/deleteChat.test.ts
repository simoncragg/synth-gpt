import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { buildHttpPostEvent, buildContext } from "./builders";
import { main } from "@functions/deleteChat/handler";
import { ChatRepository } from "../../src/repositories/ChatRepository";

jest.mock("../../src/repositories/ChatRepository");

describe("deleteChat handler", () => {
	const context = buildContext("chats");
	const chatId = uuidv4();
	const chatRepositoryMock = mocked(ChatRepository);

	it("should successfully deleted chat for given chatId", async () => {
		const event = buildHttpPostEvent(`/chats/${chatId}`, {}, { chatId });
		const result = await main(event, context);

		expect(ChatRepository.prototype.deleteByChatIdAsync)
			.toHaveBeenCalledWith(chatId);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({ chatId, isSuccess: true }),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		const errorMessage = "An unexpected error occurred whilst processing your request";
		chatRepositoryMock.prototype.deleteByChatIdAsync.mockRejectedValue(new Error(errorMessage));

		const event = buildHttpPostEvent(`/chats/${chatId}`, {}, { chatId });
		const result = await main(event, context);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({ chatId, isSuccess: false, error: errorMessage }),
		});
	});
});
