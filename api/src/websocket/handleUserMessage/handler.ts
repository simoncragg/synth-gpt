import { Lambda } from "aws-sdk";
import { formatJSONResponse } from "@libs/api-gateway";
import { isDev } from "../../utils.ts";

export const main: APIGatewayProxyEvent = async (event) => {
	try {
		const { payload } = JSON.parse(event.body);
		const { chatId, message, userId } = payload;
		const { connectionId } = event.requestContext;

		const eventPayload = {
			chatId,
			userId,
			message,
			connectionId,
		};

		const lambda = createLambda();
		await lambda.invoke({
			FunctionName:
				`aws-nodejs-typescript-${process.env.STAGE}-processUserMessage`,
			InvocationType: "Event",
			Payload: JSON.stringify(eventPayload),
		}).promise();

		return formatJSONResponse({
			success: true,
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst handling the user message"
		}, 500);
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
