import type { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";

const disconnect = async (event: APIGatewayProxyEvent) => {
	const { connectionId } = event.requestContext;
	try {
		console.log("Successfully disconnected: ", connectionId);
		return formatJSONResponse({
			success: true,
		});
	}
	catch (error) {
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst attempting to disconnect"
		}, 500);
	}
};

export const main = disconnect;
