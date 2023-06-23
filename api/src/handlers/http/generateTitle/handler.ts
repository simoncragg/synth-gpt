import { middyfy } from "@libs/lambda";

import type {
	BaseResponseBody,
	ValidatedEventAPIGatewayProxyEvent
} from "../types";

import ChatRepository from "@repositories/ChatRepository";
import schema from "./schema";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "@clients/openaiApiClient";


export const generateTitle: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		console.time("generateTitle");

		const { chatId } = event.pathParameters;
		const { message } = event.body;
		const messages = [
			{
				role: "user" as const,
				content: `Summarize this message in three words:\n\n${message}`
			}
		];

		const { content: title } = await generateChatResponseAsync(messages);

		const chatRepository = new ChatRepository();
		await chatRepository.updateTitleAsync(chatId, title);

		console.timeEnd("generateTitle");

		return formatJSONResponse<GenerateTitleResponseBody>({
			chatId,
			title,
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

export const main = middyfy(generateTitle);

export interface GenerateTitleResponseBody extends BaseResponseBody {
	chatId: string;
	title: string;
}
