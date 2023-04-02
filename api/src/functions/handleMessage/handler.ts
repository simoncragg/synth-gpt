import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { v4 as uuidv4 } from "uuid";
import { ChatRepository } from "../../repositories/ChatRepository";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "../../proxies/openaiApiProxy";
import { middyfy } from "@libs/lambda";
import { prePrompt } from "../../constants";
import schema from "./schema";

const handleMessage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		console.time("handleMessage");

		const { id: chatId } = event.pathParameters;
		const message = event.body as ChatMessage;

		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByIdAsync(chatId) ?? {
			id: chatId,
			messages: [],
		};

		chat.messages.push(message);

		const { content } = await generateChatResponseAsync(
			[
				{
					role: "system" as const,
					content: prePrompt,
				},
				...chat.messages.map(msg => {
					return { role: msg.role, content: msg.content };
				})
			]
		);

		const assistantMessage = {
			id: uuidv4(),
			role: "assistant" as const,
			content,
			timestamp: Date.now(),
		};
		chat.messages.push(assistantMessage);

		await chatRepository.updateItemAsync(chat);

		console.timeEnd("handleMessage");

		return formatJSONResponse<HandleMessageResponseBody>({
			message: assistantMessage
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		console.timeEnd("handleMessage");
		return formatJSONResponse<ErrorResponseBody>({
			error: "An unexpected error occurred whilst processing your request"
		}, 500);
	}
};

export const main = middyfy(handleMessage);
