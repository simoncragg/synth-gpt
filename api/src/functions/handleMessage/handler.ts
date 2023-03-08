import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "../../proxies/openaiApiProxy";
import { middyfy } from "@libs/lambda";
import { prePrompt } from "../../constants";
import schema from "./schema";

const handleMessage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		console.time("handleMessage");

		const chatId = event.pathParameters.id;
		const { message } = event.body;

		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByIdAsync(chatId) ?? {
			id: chatId,
			messages: [{
				role: "system",
				content: prePrompt,
				timestamp: Date.now(),
			}]
		};

		chat.messages.push({
			role: "user",
			content: message,
			timestamp: Date.now()
		});

		const { content } = await generateChatResponseAsync(
			chat.messages.map(msg => {
				return { role: msg.role, content: msg.content };
			})
		);

		chat.messages.push({
			role: "assistant",
			content,
			timestamp: Date.now()
		});

		await chatRepository.updateItemAsync(chat);

		console.timeEnd("handleMessage");

		return formatJSONResponse<HandleMessageResponseBody>({
			message: `${content}`
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<ErrorResponseBody>({
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(handleMessage);
