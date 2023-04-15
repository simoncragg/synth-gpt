import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { buildHttpPostEvent, buildContext } from "./builders";
import { main } from "@http/patchChat/handler";
import { ChatRepository } from "@repositories/ChatRepository";

jest.mock("@repositories/ChatRepository");

describe("patch chat handler", () => {
	const chatId = uuidv4();
	const title = "New title";
	const context = buildContext("patchChat");
	const chatRepositoryMock = mocked(ChatRepository);

	it("should patch the chat in the ChatRepository", async () => {
		jest.spyOn(chatRepositoryMock.prototype, "updateTitleAsync");

		const event = buildHttpPostEvent(`/chats/${chatId}`, { title }, { chatId });
		const result = await main(event, context);

		expect(chatRepositoryMock.prototype.updateTitleAsync)
			.toHaveBeenCalledWith(chatId, title);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				success: true
			}),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		const errorMessage = "An unexpected error occurred whilst processing your request";
		chatRepositoryMock.prototype.updateTitleAsync.mockRejectedValue(new Error(errorMessage));

		const event = buildHttpPostEvent(`/chats/${chatId}`, { title }, { chatId });
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
