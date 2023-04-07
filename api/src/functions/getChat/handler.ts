import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const getChat: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		const chatId = event.pathParameters.chatId;
		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByChatIdAsync(chatId);

		return formatJSONResponse<Chat>(chat);
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<ErrorResponseBody>({
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(getChat);
