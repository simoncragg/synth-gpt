import { mocked } from "jest-mock";

import WebSocketTokenRepository from "@repositories/WebSocketTokenRepository";
import { buildContext, buildHttpPostEvent } from "./builders";
import { createWsToken } from "@handlers/http/createWsToken/handler";

const tokenId = "token-123";

jest.mock("uuid", () => ({
	__esModule: true,
	v4: () => tokenId,
}));

jest.mock("@repositories/WebSocketTokenRepository");

type CreateWsTokenRequestBodyType = {
	userId: string;
};

describe("createWsToken handler", () => {
	const userId = "user-123";
	const context = buildContext("createWsToken");
	const webSocketTokenRepository = mocked(WebSocketTokenRepository);

	const now = Date.now();
	jest.spyOn(Date, "now").mockReturnValue(now);

	it("should create a valid ws-token", async () => {
		const event = buildHttpPostEvent<CreateWsTokenRequestBodyType>(
			"/auth/createWsToken",
			{ userId }
		);

		await createWsToken(event, context, null);

		expect(webSocketTokenRepository.prototype.updateItemAsync)
			.toHaveBeenCalledWith(expect.objectContaining({
				tokenId,
				userId,
				connectionId: null,
				claimedTime: null,
				expiryTime: now + 30000,
				createdTime: now,
				timeToLive: now + 604800000,
			}));
	});

	it("should return a valid 200 response", async () => {
		const event = buildHttpPostEvent<CreateWsTokenRequestBodyType>(
			"/auth/createWsToken",
			{ userId }
		);

		const result = await createWsToken(event, context, null);

		expect(result).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				tokenId,
				expiryTime: now + 30000,
				success: true,
			}),
		});
	});

	it("should return an error response if an unexpected error occurs", async () => {
		const errorMessage = "An unexpected error occurred whilst processing your request";
		webSocketTokenRepository.prototype.updateItemAsync.mockRejectedValue(new Error(errorMessage));

		const event = buildHttpPostEvent<CreateWsTokenRequestBodyType>(
			"/auth/createWsToken",
			{ userId }
		);
		const result = await createWsToken(event, context, null);

		expect(result).toEqual({
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				error: errorMessage,
			}),
		});
	});
});
