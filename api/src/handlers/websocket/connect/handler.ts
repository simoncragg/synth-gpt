import type { APIGatewayProxyEvent } from "aws-lambda";
import WebSocketTokenRepository from "@repositories/WebSocketTokenRepository";
import { formatJSONResponse } from "@libs/api-gateway";

const connect = async (event: APIGatewayProxyEvent) => {
	const { connectionId } = event.requestContext;
	const { tokenId } = event.queryStringParameters;
	const now = Date.now();

	try {
		const webSocketTokenRepository = new WebSocketTokenRepository();
		const token = await webSocketTokenRepository.getByTokenIdAsync(tokenId);

		if (!token || (token.claimedTime || now > token.expiryTime)) {
			return {
				statusCode: 401,
			};
		}

		token.claimedTime = now;
		token.connectionId = connectionId;
		await webSocketTokenRepository.updateItemAsync(token);

		console.log("Connection established: ", connectionId);
		return {
			statusCode: 200,
			headers: {
				Connection: "keep-alive",
			}
		};
	}
	catch (error) {
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst establishing a connection"
		}, 500);
	}
};

export const main = connect;
