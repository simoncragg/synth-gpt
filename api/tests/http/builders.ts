//import { JsonValue } from "type-fest";

export function buildHttpGetEvent(
	path: string,
	pathParameters: { [key: string]: string },
	queryStringParameters: { [key: string]: string } = null,
) {
	return {
		body: null,
		httpMethod: "GET",
		headers: {},
		multiValueHeaders: {},
		isBase64Encoded: false,
		path,
		pathParameters,
		queryStringParameters,
		multiValueQueryStringParameters: null,
		stageVariables: null,
		requestContext: null,
		resource: null,
	};
}

export function buildHttpPatchEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null
) {
	return {
		...buildHttpPostEvent<T>(path, body, pathParameters),
		httpMethod: "PATCH",
	};
}

export function buildHttpDeleteEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null
) {
	return {
		...buildHttpPostEvent<T>(path, body, pathParameters),
		httpMethod: "DELETE",
	};
}

export function buildHttpPostEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null
) {
	return {
		body,
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
