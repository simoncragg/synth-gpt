import {
	ApiGatewayManagementApiClient,
	PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { isDev } from "../utils";

export async function postToConnectionAsync(
	connectionId: string,
	data: unknown) {
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