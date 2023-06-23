import type { APIGatewayProxyResult } from "aws-lambda";

export function formatJSONResponse<T>(response: T, statusCode = 200): APIGatewayProxyResult {
	return {
		statusCode,
		body: JSON.stringify(response),
	};
}
