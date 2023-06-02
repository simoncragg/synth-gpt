import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const connect: APIGatewayProxyEvent = async (event) => {
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

export const main = middyfy(connect);
