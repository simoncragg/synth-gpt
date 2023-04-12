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
			return result?.Item as Chat | undefined;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get chat");
		}
	}

	async getByUserIdAsync(userId: string): Promise<ChatWithoutMessages[]> {
		const params: DocumentClient.QueryInput = {
			TableName: chatsTableName,
			IndexName: "userId-index",
			KeyConditionExpression: "userId = :userId",
			ExpressionAttributeValues: {
				":userId": userId
			},
			ProjectionExpression: "chatId, userId, title, createdTime, updatedTime"
		};

		try {
			const result = await this.documentClient.query(params).promise();
			const chats = result.Items as ChatWithoutMessages[];
			return chats.sort((a, b) =>
				b.updatedTime - a.updatedTime
			);
		} catch (error) {
			console.error(error);
			throw new Error(`Failed to get chats for userId: ${userId}`);
		}
	}

	async updateItemAsync(chat: Chat): Promise<void> {
		const params = {
			TableName: chatsTableName,
			Key: { chatId: chat.chatId },
			UpdateExpression: [
				"set userId = :userId,",
				"title = :title,",
				"messages = :messages,",
				"createdTime = :createdTime,",
				"updatedTime = :updatedTime"
			].join(" "),
			ExpressionAttributeValues: {
				":userId": chat.userId,
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

	async updateTitleAsync(
		chatId: string,
		title: string
	): Promise<void> {
		const params = {
			TableName: chatsTableName,
			Key: { chatId },
			UpdateExpression: [
				"set title = :title"
			].join(" "),
			ExpressionAttributeValues: {
				":title": title
			},
		};

		try {
			await this.documentClient.update(params).promise();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to update chat");
		}
	}

	async deleteByChatIdAsync(chatId: string): Promise<void> {
		const params = {
			TableName: chatsTableName,
			Key: { chatId },
		};

		try {
			await this.documentClient.delete(params).promise();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to delete chat");
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
