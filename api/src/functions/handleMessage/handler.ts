import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuidv4 } from "uuid";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { newChatText } from "../../constants";
import { prePrompt } from "../../constants";
import { ChatRepository } from "../../repositories/ChatRepository";
import schema from "./schema";

const handleMessage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		console.time("handleMessage");

		const userId = "user-123";
		const { chatId } = event.pathParameters;
		const message = event.body as ChatMessage;

		const chatRepository = new ChatRepository();
		const chat = await chatRepository.getByChatIdAsync(chatId) ?? {
			chatId,
			title: newChatText,
			userId,
			messages: [],
			createdTime: Date.now(),
			updatedTime: Date.now(),
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

		chat.updatedTime = Date.now();
		await chatRepository.updateItemAsync(chat);

		console.timeEnd("handleMessage");

		return formatJSONResponse<HandleMessageResponseBody>({
			message: assistantMessage,
			success: true,
		});
	}
	catch (error) {
		console.log(error, { level: "error" });
		console.timeEnd("handleMessage");
		return formatJSONResponse<BaseResponseBody>({
			success: false,
			error:
				"An unexpected error occurred whilst processing your request",
		}, 500);
	}
};

export const main = middyfy(handleMessage);
