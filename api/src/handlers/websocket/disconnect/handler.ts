import type { APIGatewayProxyEvent } from "aws-lambda";

const disconnect = async (event: APIGatewayProxyEvent) => {
	const { connectionId } = event.requestContext;
	try {
		console.log("Successfully disconnected: ", connectionId);
		return {
			statusCode: 200,
		};
	}
	catch (error) {
		console.error(error);
		return {
			statusCode: 500,
		};
	}
};

export const main = disconnect;
