import { middyfy } from "@libs/lambda";

import type { BaseResponseBody } from "../types";
import type { ChatWithoutMessages } from "../../../types";

import ChatRepository from "@repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";

export const getChats = async (event) => {
	try {
		const userId = event.queryStringParameters["userId"];
		const chatRepository = new ChatRepository();
		const chats = await chatRepository.getByUserIdAsync(userId);
		return formatJSONResponse<GetChatsResponseBody>({
			chats,
			success: true,
		});
	}
	catch (error) {
		console.error(error);
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(getChats);

export interface GetChatsResponseBody extends BaseResponseBody {
	chats: ChatWithoutMessages[];
}
