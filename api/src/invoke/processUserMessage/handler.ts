import { v4 as uuidv4 } from "uuid";
import { generateChatResponseAsync } from "@proxies/openaiApiProxy";
import { newChatText, prePrompt } from "../../constants";
import { postToConnectionAsync } from "@proxies/apiGatewayManagementApiClientProxy";
import { ChatRepository } from "@repositories/ChatRepository";
import { Handler } from "aws-lambda";

export const main: Handler = async (event) => {
	console.time("processUserMessage");

	try {
		const {
			connectionId,
			chatId,
			userId,
			message,
		} = event;

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

		await postToConnectionAsync(connectionId, {
			chatId,
			message: assistantMessage
		});

		chat.messages.push(assistantMessage);
		chat.updatedTime = Date.now();
		await chatRepository.updateItemAsync(chat);

		console.timeEnd("processUserMessage");
	}
	catch (error) {
		console.log(error, { level: "error" });
	}
};
