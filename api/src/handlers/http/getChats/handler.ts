import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import ChatRepository from "@repositories/ChatRepository";
import schema from "./schema";

export const getChats: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
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
		console.log(error, { level: "error" });
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(getChats);
