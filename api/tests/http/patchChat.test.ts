import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import ChatRepository from "@repositories/ChatRepository";
import { buildHttpPatchEvent } from "../builders";
import { patchChat } from "@handlers/http/patchChat/handler";

jest.mock("@repositories/ChatRepository");

type PatchChatRequestBodyType = {
	title: string;
};

describe("patch chat handler", () => {
	const chatId = uuidv4();
	const title = "New title";
	const chatRepositoryMock = mocked(ChatRepository);

	it("should patch the chat in the ChatRepository", async () => {
		const event = buildHttpPatchEvent<PatchChatRequestBodyType>(
			`/chats/${chatId}`, { title }, { chatId }
		);
		const result = await patchChat(event, null, null);

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

		const event = buildHttpPatchEvent<PatchChatRequestBodyType>(
			`/chats/${chatId}`, { title }, { chatId }
		);
		const result = await patchChat(event, null, null);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: errorMessage
			}),
		});
	});
});
