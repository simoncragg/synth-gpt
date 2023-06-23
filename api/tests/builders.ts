import type {
	APIGatewayEventIdentity,
	APIGatewayProxyEvent,
	APIGatewayEventDefaultAuthorizerContext,
	APIGatewayEventRequestContextWithAuthorizer,
} from "aws-lambda";

import type { ValidatedAPIGatewayProxyEvent } from "./types";

export function buildHttpGetEvent(
	path: string,
	pathParameters: { [key: string]: string },
	queryStringParameters: { [key: string]: string } = null,
): APIGatewayProxyEvent {
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

export function buildHttpDeleteEvent(
	path: string,
	pathParameters: { [key: string]: string } = null
): APIGatewayProxyEvent {
	return {
		body: null,
		httpMethod: "DELETE",
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

export function buildHttpPatchEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null
): ValidatedAPIGatewayProxyEvent<T> {
	return {
		...buildValidatedApiGatewayProxyEvent<T>(path, body, pathParameters),
		httpMethod: "PATCH",
	};
}

export function buildHttpPostEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null
): ValidatedAPIGatewayProxyEvent<T> {
	return {
		...buildValidatedApiGatewayProxyEvent<T>(path, body, pathParameters),
		httpMethod: "POST",
	};
}

export function buildValidatedApiGatewayProxyEvent<T>(
	path: string,
	body: T,
	pathParameters: { [key: string]: string } = null,
): ValidatedAPIGatewayProxyEvent<T> {
	return {
		body,
		httpMethod: "",
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

export function buildApiGatewayProxyEvent(
	path: string,
	body: string,
	pathParameters: { [key: string]: string } = null
): APIGatewayProxyEvent {
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

export function buildRequestContextWithConnectionId(
	connectionId: string
): APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> {
	return {
		connectionId,
		authorizer: {},
		accountId: "account-id",
		apiId: "api-id",
		protocol: "",
		httpMethod: "",
		identity: buildIdentity(),
		path: "",
		stage: "",
		requestId: "",
		requestTimeEpoch: 0,
		resourceId: "",
		resourcePath: "",
	};
}

export function buildIdentity(): APIGatewayEventIdentity {
	return {
		accessKey: null,
		accountId: null,
		apiKey: null,
		apiKeyId: null,
		caller: null,
		clientCert: null,
		cognitoAuthenticationProvider: null,
		cognitoAuthenticationType: null,
		cognitoIdentityId: null,
		cognitoIdentityPoolId: null,
		principalOrgId: null,
		sourceIp: null,
		user: null,
		userAgent: null,
		userArn: null,
	};
}
