import { DocumentClient } from "aws-sdk/clients/dynamodb";

import type { WebSocketToken } from "../types";

const wsTokenTableName = `ws-token-${process.env.STAGE}`;

export default class WebSocketTokenRepository {
	private readonly documentClient: DocumentClient;

	constructor() {
		this.documentClient = new DocumentClient(this.getClientConfig());
	}

	async getByTokenIdAsync(tokenId: string): Promise<WebSocketToken | undefined> {
		const params = {
			TableName: wsTokenTableName,
			Key: { tokenId },
		};

		try {
			const result = await this.documentClient.get(params).promise();
			return result?.Item as WebSocketToken | undefined;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get ws-token");
		}
	}

	async updateItemAsync(token: WebSocketToken): Promise<void> {
		const params = {
			TableName: wsTokenTableName,
			Key: { tokenId: token.tokenId },
			UpdateExpression: [
				"set userId = :userId,",
				"connectionId = :connectionId,",
				"expiryTime = :expiryTime,",
				"claimedTime = :claimedTime,",
				"createdTime = :createdTime,",
				"timeToLive = :timeToLive",
			].join(" "),
			ExpressionAttributeValues: {
				":userId": token.userId,
				":connectionId": token.connectionId,
				":expiryTime": token.expiryTime,
				":claimedTime": token.claimedTime,
				":createdTime": token.createdTime,
				":timeToLive": token.timeToLive,
			},
		};

		try {
			await this.documentClient.update(params).promise();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to update ws-token");
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
