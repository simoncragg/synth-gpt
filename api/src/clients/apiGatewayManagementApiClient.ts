import {
	ApiGatewayManagementApiClient,
	PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import type { WebSocketMessage } from "../types";
import { isDev } from "../constants";

export async function postToConnectionAsync(connectionId: string, data: WebSocketMessage) {
	const client = createApiGatewayApi();
	const requestParams = {
		ConnectionId: connectionId,
		Data: Buffer.from(
			JSON.stringify(data)
		),
	};
	const command = new PostToConnectionCommand(requestParams);
	await client.send(command);
}

function createApiGatewayApi() {
	return isDev ?
		new ApiGatewayManagementApiClient({
			endpoint: "http://localhost:4001",
			credentials: {
				accessKeyId: "local",
				secretAccessKey: "local"
			}
		})
		:
		new ApiGatewayManagementApiClient({
			region: process.env.REGION,
		});
}