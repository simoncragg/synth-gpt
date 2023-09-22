import type { MockedFunction } from "jest-mock";
import { mocked } from "jest-mock";

import type { Activity, WebSocketMessage } from "@src/types";
import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import { baseAudioUrl } from "./constants";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

jest.mock("@clients/apiGatewayManagementApiClient");

type PostToConnectionMockedFunction = MockedFunction<(connectionId: string, data: WebSocketMessage) => Promise<void>>;

class PostToConnectionMockUtility {

	private readonly postToConnectionMock: PostToConnectionMockedFunction;
  
	constructor() {
		this.postToConnectionMock = mocked(postToConnectionAsync);
	}
  
	expectContentToBePostedToClient(
		content: string,
		userMessagePayload: ProcessUserMessagePayload,
		isLastSegment = false
	){
		expect(this.postToConnectionMock).toHaveBeenCalledWith(
			userMessagePayload.connectionId,
			{
				type: "assistantMessageSegment",
				payload: {
					chatId: userMessagePayload.chatId,
					message: {
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						content,
						timestamp: expect.any(Number),
					},
					isLastSegment,
				},
			},
		);
	}

	expectActivityToBePostedToClient(
		activity: Activity,
		userMessagePayload: ProcessUserMessagePayload,
		isLastSegment = false
	){
		expect(this.postToConnectionMock).toHaveBeenCalledWith(
			userMessagePayload.connectionId,
			{
				type: "assistantMessageSegment",
				payload: {
					chatId: userMessagePayload.chatId,
					message: {
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						activity,
						timestamp: expect.any(Number),
					},
					isLastSegment,
				},
			},
		);
	}

	expectAudioMessageToBePostedToClient (
		transcript: string,
		userMessagePayload: ProcessUserMessagePayload
	) {
		const { connectionId, chatId } = userMessagePayload;
		expect(this.postToConnectionMock).toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: new URL(baseAudioUrl + encodeURIComponent(transcript) + ".mpg"),
						timestamp: expect.any(Number),
					},
				},
			},
		);
	}
    
	expectAudioMessageNotToBePostedToClient(
		transcript: string,
		userMessagePayload: ProcessUserMessagePayload
	) {
		const { connectionId, chatId } = userMessagePayload;
		expect(this.postToConnectionMock).not.toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: new URL(baseAudioUrl + encodeURIComponent(transcript) + ".mpg"),
						timestamp: expect.any(Number),
					},
				},
			},
		);
	}
}

export default PostToConnectionMockUtility;
  