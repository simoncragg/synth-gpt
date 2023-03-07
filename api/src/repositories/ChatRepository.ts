import { DocumentClient } from "aws-sdk/clients/dynamodb";

const DYNAMODB_TABLE_NAME = `chats-${process.env.STAGE}`;

export class ChatRepository {
	private readonly documentClient: DocumentClient;

	constructor() {
		this.documentClient = new DocumentClient(this.getClientConfig());
	}

	async getByIdAsync(id: string): Promise<Chat | undefined> {
		const params = {
			TableName: DYNAMODB_TABLE_NAME,
			Key: { id },
		};

		try {
			const result = await this.documentClient.get(params).promise();
			if (!result.Item) {
				return undefined;
			}

			return this.toChat(result.Item);
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get chat");
		}
	}

	async updateItemAsync(chat: Chat): Promise<void> {
		const params = {
			TableName: DYNAMODB_TABLE_NAME,
			Key: { id: chat.id },
			UpdateExpression: "set messages = :messages",
			ExpressionAttributeValues: { ":messages": chat.messages },
		};

		try {
			await this.documentClient.update(params).promise();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to update chat");
		}
	}

	private toChat(item: DocumentClient.AttributeMap): Chat {
		return {
			id: item.id,
			messages: item.messages,
		};
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
