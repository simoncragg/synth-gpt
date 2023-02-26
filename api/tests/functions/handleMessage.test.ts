import { main } from "@functions/handleMessage/handler";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { JsonValue } from "type-fest";

describe("handleMessage handler", () => {

	const body = { message: "this is a test" };

	const event: Omit<APIGatewayProxyEvent, "body"> & { body: JsonValue; rawBody: string; } = {
		body,
		rawBody: JSON.stringify(body),
		httpMethod: "POST",
		headers: {},
		multiValueHeaders: {},
		isBase64Encoded: false,
		path: "/handleMessage",
		pathParameters: null,
		queryStringParameters: null,
		multiValueQueryStringParameters: null,
		stageVariables: null,
		requestContext: null,
		resource: null,
	};

	const context: Context = {
		callbackWaitsForEmptyEventLoop: false,
		functionName: "handleMessage",
		functionVersion: "1",
		invokedFunctionArn: null,
		memoryLimitInMB: "1",
		awsRequestId: null,
		logGroupName: null,
		logStreamName: null,
		getRemainingTimeInMillis: () => 0,
		done: jest.fn(),
		fail: jest.fn(),
		succeed: jest.fn()
	};

	it("handleMessage parrots the incoming message", async () => {
		const result = await main(event, context);
		expect(result).toHaveProperty("statusCode", 200);
		expect(JSON.parse(result.body).message).toEqual(`${body.message}.`);
	});
});
