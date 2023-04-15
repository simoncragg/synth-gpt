import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "@repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const patchChat: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const { chatId } = event.pathParameters;
	try {
		const { title } = event.body;
		const chatRepository = new ChatRepository();
		await chatRepository.updateTitleAsync(chatId, title);

		return formatJSONResponse<BaseResponseBody>({
			success: true,
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request",
		}, 500);
	}
};

export const main = middyfy(patchChat);
