import type { APIGatewayProxyEvent } from "aws-lambda";
import { middyfy } from "@libs/lambda";

import type { BaseResponseBody } from "../types";
import type { Chat } from "../../../types";

import ChatRepository from "@repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";

export const getChat = async (event: APIGatewayProxyEvent) => {
	try {
		const chatId = event.pathParameters.chatId;
		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByChatIdAsync(chatId);

		const filteredChat = {
			...chat,
			messages: chat.messages.filter(msg => (msg.role !== "function"))
		};

		return formatJSONResponse<GetChatResponseBody>({
			chat: filteredChat,
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

export const main = middyfy(getChat);

export interface GetChatResponseBody extends BaseResponseBody {
	chat: Chat;
}
