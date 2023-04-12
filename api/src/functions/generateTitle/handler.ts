import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "../../proxies/openaiApiProxy";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const generateTitle: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
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
			title
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<ErrorResponseBody>({
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(generateTitle);
