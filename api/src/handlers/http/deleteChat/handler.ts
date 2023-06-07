import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import ChatRepository from "@repositories/ChatRepository";

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
