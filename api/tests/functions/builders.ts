import { JsonValue } from "type-fest";

export function buildHttpPostEvent(path: string, body: JsonValue, pathParameters: { [key: string]: string } = null) {
	return {
		body,
		rawBody: JSON.stringify(body),
		httpMethod: "POST",
		headers: {},
		multiValueHeaders: {},
		isBase64Encoded: false,
		path,
		pathParameters,
		queryStringParameters: null,
		multiValueQueryStringParameters: null,
		stageVariables: null,
		requestContext: null,
		resource: null,
	};
}

export function buildContext(functionName: string) {
	return {
		callbackWaitsForEmptyEventLoop: false,
		functionName,
		functionVersion: "1",
		invokedFunctionArn: null,
		memoryLimitInMB: "1",
		awsRequestId: null,
		logGroupName: null,
		logStreamName: null,
		getRemainingTimeInMillis: () => 0,
		done: jest.fn(),
		fail: jest.fn(),
		succeed: jest.fn(),
	};
}
