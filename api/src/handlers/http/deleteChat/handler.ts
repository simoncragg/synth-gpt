import { middyfy } from "@libs/lambda";

import type { BaseResponseBody } from "../types";

import ChatRepository from "@repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";

export const deleteChat = async (event) => {
	const { chatId } = event.pathParameters;
	try {
		const chatRepository = new ChatRepository();
		await chatRepository.deleteByChatIdAsync(chatId);
		return formatJSONResponse<BaseResponseBody>({
			success: true
		});
	}
	catch (error) {
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(deleteChat);
