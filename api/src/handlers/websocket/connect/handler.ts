import type { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";

const connect = async (event: APIGatewayProxyEvent) => {
	const { connectionId } = event.requestContext;
	try {
		console.log("Connection established: ", connectionId);
		return {
			statusCode: 200,
			headers: {
				Connection: "keep-alive",
			}
		};
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst establishing a connection"
		}, 500);
	}
};

export const main = connect;
