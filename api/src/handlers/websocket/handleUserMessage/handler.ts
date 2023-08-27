import type { APIGatewayProxyEvent } from "aws-lambda";
import { Lambda } from "aws-sdk";

import { formatJSONResponse } from "@libs/api-gateway";
import { isDev } from "../../../constants";

const handleUserMessage = async (event: APIGatewayProxyEvent) => {
	try {
		const { connectionId } = event.requestContext;
		const { payload } = JSON.parse(event.body);
		const { chatId, userId, model, message } = payload;
		
		const eventPayload = {
			connectionId,
			chatId,
			userId,
			model,
			message,
		};

		const lambda = createLambda();
		await lambda.invoke({
			FunctionName:
				`synth-gpt-${process.env.STAGE}-processUserMessage`,
			InvocationType: "Event",
			Payload: JSON.stringify(eventPayload),
		}).promise();

		return formatJSONResponse({
			success: true,
		});
	}
	catch (error) {
		console.error(error);
		return {
			statusCode: 500
		};
	}
};

function createLambda() {
	return isDev ?
		new Lambda({
			endpoint: "http://localhost:3002",
			credentials: {
				accessKeyId: "local",
				secretAccessKey: "local",
			},
		})
		: new Lambda();
}

export const main = handleUserMessage;
