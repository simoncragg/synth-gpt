import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const getChats: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
	try {
		const chatRepository = new ChatRepository();
		const chats = await chatRepository.getByUserIdAsync("user-123");
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
