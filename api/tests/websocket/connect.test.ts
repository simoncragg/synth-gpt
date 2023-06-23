import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import WebSocketTokenRepository from "@repositories/WebSocketTokenRepository";
import { main as connect } from "@websocket/connect/handler";

jest.mock("@repositories/WebSocketTokenRepository");

describe("connect", () => {
	const tokenId = uuidv4();
	const connectionId = "test-connection-id";
	const webSocketTokenRepositoryMock = mocked(WebSocketTokenRepository.prototype);
	let event;

	beforeEach(() => {
		event = {
			requestContext: {
				connectionId,
			},
			queryStringParameters: {
				tokenId,
			},
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return 401 status code if token does not exist", async () => {
		webSocketTokenRepositoryMock.getByTokenIdAsync.mockResolvedValueOnce(null);

		const response = await connect(event);

		expect(webSocketTokenRepositoryMock.getByTokenIdAsync).toHaveBeenCalledWith(tokenId);
		expect(webSocketTokenRepositoryMock.updateItemAsync).not.toHaveBeenCalled();
		expect(response).toEqual({ statusCode: 401 });
	});

	it("should return 401 status code if token has been already been claimed", async () => {
		const createdTime = Date.now() - 5000;
		const claimedTime = createdTime + 2500;
		const expiryTime = createdTime + 30000;
		const timeToLive = createdTime + 604800000;

		const token = {
			tokenId: event.queryStringParameters.tokenId,
			userId: "user-123",
			connectionId: null,
			claimedTime,
			expiryTime,
			createdTime,
			timeToLive,
		};
		webSocketTokenRepositoryMock.getByTokenIdAsync.mockResolvedValueOnce(token);

		const response = await connect(event);

		expect(webSocketTokenRepositoryMock.getByTokenIdAsync).toHaveBeenCalledWith(tokenId);
		expect(webSocketTokenRepositoryMock.updateItemAsync).not.toHaveBeenCalled();
		expect(response).toEqual({ statusCode: 401 });
	});

	it("should return 401 status code if token has expired", async () => {
		const createdTime = Date.now() - 31000;
		const expiryTime = Date.now() - 1000;
		const timeToLive = createdTime + 604800000;

		const token = {
			tokenId,
			userId: "user-123",
			connectionId: null,
			claimedTime: null,
			expiryTime,
			createdTime,
			timeToLive,
		};
		webSocketTokenRepositoryMock.getByTokenIdAsync.mockResolvedValueOnce(token);

		const response = await connect(event);

		expect(webSocketTokenRepositoryMock.getByTokenIdAsync).toHaveBeenCalledWith(tokenId);
		expect(webSocketTokenRepositoryMock.updateItemAsync).not.toHaveBeenCalled();
		expect(response).toEqual({ statusCode: 401 });
	});

	it("should establish a connection and return 200 status code if token is valid", async () => {
		const createdTime = Date.now() - 5000;
		const expiryTime = createdTime + 30000;
		const timeToLive = createdTime + 604800000;

		const token = {
			tokenId,
			userId: "user-123",
			connectionId: null,
			claimedTime: null,
			expiryTime,
			createdTime,
			timeToLive,
		};
		webSocketTokenRepositoryMock.getByTokenIdAsync.mockResolvedValueOnce(token);

		const response = await connect(event);

		expect(webSocketTokenRepositoryMock.getByTokenIdAsync).toHaveBeenCalledWith(tokenId);
		expect(webSocketTokenRepositoryMock.updateItemAsync).toHaveBeenCalledWith(expect.objectContaining({
			claimedTime: expect.any(Number),
			connectionId,
		}));
		expect(response).toEqual({
			statusCode: 200,
			headers: {
				Connection: "keep-alive",
			},
		});
	});

	it("should handle errors and return a formatted error response", async () => {
		const error = new Error("Test error");
		webSocketTokenRepositoryMock.getByTokenIdAsync.mockRejectedValueOnce(error);

		const response = await connect(event);

		expect(webSocketTokenRepositoryMock.getByTokenIdAsync).toHaveBeenCalledWith(tokenId);
		expect(webSocketTokenRepositoryMock.updateItemAsync).not.toHaveBeenCalled();
		expect(response).toEqual({
			statusCode: 500
		});
	});
});
