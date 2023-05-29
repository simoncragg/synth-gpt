import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import ChatRepository from "@repositories/ChatRepository";
import schema from "./schema";

const getChat: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const chatId = event.pathParameters.chatId;
		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByChatIdAsync(chatId);

		const filteredChat = {
			...chat,
			messages: chat.messages.filter(msg =>
				!(msg.content.type === "text" && (msg.content.value as string).startsWith("```json\n{webSearchResults:"))
			)
		};

		return formatJSONResponse<GetChatResponseBody>({
			chat: filteredChat,
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

export const main = middyfy(getChat);
