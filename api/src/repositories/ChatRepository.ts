import { DocumentClient } from "aws-sdk/clients/dynamodb";

const chatsTableName = `chats-${process.env.STAGE}`;

export class ChatRepository {
	private readonly documentClient: DocumentClient;

	constructor() {
		this.documentClient = new DocumentClient(this.getClientConfig());
	}

	async getByChatIdAsync(chatId: string): Promise<Chat | undefined> {

		const params = {
			TableName: chatsTableName,
			Key: { chatId },
		};

		try {
			const result = await this.documentClient.get(params).promise();
			return result.Item as Chat;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get chat");
		}
	}

	async updateItemAsync(chat: Chat): Promise<void> {
		const params = {
			TableName: chatsTableName,
			Key: { chatId: chat.chatId },
			UpdateExpression: [
				"set title = :title,",
				"messages = :messages,",
				"createdTime = :createdTime,",
				"updatedTime = :updatedTime"
			].join(" "),
			ExpressionAttributeValues: {
				":title": chat.title,
				":messages": chat.messages,
				":createdTime": chat.createdTime,
				":updatedTime": chat.updatedTime
			},
		};

		try {
			await this.documentClient.update(params).promise();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to update chat");
		}
	}

	private getClientConfig() {
		return process.env.STAGE !== "dev"
			? { region: process.env.REGION }
			: {
				region: "localhost",
				endpoint: "http://localhost:8000",
				accessKeyId: "DUMMY_ACCESS_KEY",
				secretAccessKey: "DUMMY_SECRET_ACCESS_KEY",
			};
	}
}
