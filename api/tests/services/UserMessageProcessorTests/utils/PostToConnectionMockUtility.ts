import type { MockedFunction } from "jest-mock";

import type { Activity, WebSocketMessage } from "@src/types";
import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import { baseAudioUrl } from "./constants";

type PostToConnectionMockedFunction = MockedFunction<(connectionId: string, data: WebSocketMessage) => Promise<void>>

class PostToConnectionMockUtility {

	private mockedFunction: PostToConnectionMockedFunction;
  
	constructor(mockedFunction: PostToConnectionMockedFunction) {
		this.mockedFunction = mockedFunction;
	}
  
	expectContentToBePostedToClient(
		content: string,
		userMessagePayload: ProcessUserMessagePayload,
		isLastSegment = false
	){
		expect(this.mockedFunction).toHaveBeenCalledWith(
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
		expect(this.mockedFunction).toHaveBeenCalledWith(
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
		expect(this.mockedFunction).toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: baseAudioUrl + encodeURIComponent(transcript) + ".mpg",
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
		expect(this.mockedFunction).not.toHaveBeenCalledWith(
			connectionId,
			{
				type: "assistantAudioSegment",
				payload: {
					chatId,
					audioSegment: {
						audioUrl: baseAudioUrl + encodeURIComponent(transcript) + ".mpg",
						timestamp: expect.any(Number),
					},
				},
			},
		);
	}
}

export default PostToConnectionMockUtility;
  