import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuidv4 } from "uuid";

import WebSocketTokenRepository from "@repositories/WebSocketTokenRepository";
import schema from "./schema";
import { formatJSONResponse } from "@libs/api-gateway";

export const createWsToken: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const { userId } = event.body;
		const now = Date.now();
		const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

		const token = {
			tokenId: uuidv4(),
			userId,
			connectionId: null,
			expiryTime: now + 30000,
			claimedTime: null,
			createdTime: now,
			timeToLive: now + sevenDaysMs,
		};

		const webSocketTokenRepository = new WebSocketTokenRepository();
		await webSocketTokenRepository.updateItemAsync(token);

		return formatJSONResponse<WebSocketTokenResponseBody>({
			tokenId: token.tokenId,
			expiryTime: token.expiryTime,
			success: true,
		});
	}
	catch (error) {
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request",
		}, 500);
	}
};

export const main = middyfy(createWsToken);
