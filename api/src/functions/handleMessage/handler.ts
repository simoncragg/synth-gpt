import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "../../proxies/openaiApiProxy";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const handleMessage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const userInput = event.body.message;
		const response = await generateChatResponseAsync(userInput);

		return formatJSONResponse<HandleMessageResponseBody>({
			message: `${response.content}`
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<ErrorResponseBody>({
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(handleMessage);
