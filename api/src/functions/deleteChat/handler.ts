import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const deleteChat: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const { chatId } = event.pathParameters;
	try {
		const chatRepository = new ChatRepository();
		await chatRepository.deleteByChatIdAsync(chatId);
		return formatJSONResponse<DeleteChatResponse>({
			chatId,
			isSuccess: true
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<DeleteChatResponse>({
			chatId,
			isSuccess: false,
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(deleteChat);
