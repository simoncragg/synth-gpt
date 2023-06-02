import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const disconnect = async (event: APIGatewayProxyEvent) => {
	const { connectionId } = event.requestContext;
	try {
		console.log("Successfully disconnected: ", connectionId);
		return formatJSONResponse({
			success: true,
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst attempting to disconnect"
		}, 500);
	}
};

export const main = middyfy(disconnect);
