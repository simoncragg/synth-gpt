import { middyfy } from "@libs/lambda";

import type {
	BaseResponseBody,
	ValidatedEventAPIGatewayProxyEvent
} from "../types";

import ChatRepository from "@repositories/ChatRepository";
import schema from "./schema";
import { formatJSONResponse } from "@libs/api-gateway";

export const patchChat: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
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
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request",
		}, 500);
	}
};

export const main = middyfy(patchChat);
