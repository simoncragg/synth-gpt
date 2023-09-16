import { v4 as uuidv4 } from "uuid";

import type {
	MessageSegmentCallbackType
} from "./ChatCompletionService";

import ChatMessageBuilder from "@builders/ChatMessageBuilder";
import { Delta, FunctionCall } from "@clients/openaiApiClient";

class ChatCompletionDeltaProcessor {

	private readonly onSegmentReceived: MessageSegmentCallbackType;
	private readonly chatMessageBuilder: ChatMessageBuilder;
    
	private id: string;
	private content: string;
	private functionCall: FunctionCall;
	private isDone: boolean;
    
	constructor(onSegmentReceived: MessageSegmentCallbackType) {
		this.onSegmentReceived = onSegmentReceived;
		this.chatMessageBuilder = new ChatMessageBuilder();

		this.id = uuidv4();
		this.content = "";
		this.functionCall = {
			name: "",
			arguments: "",
		};
		this.isDone = false;
	}

	async processDelta(delta: Delta, finishReason: string) {
		this.isDone = finishReason !== null;
	
		if (delta.content) {
			await this.handleContentDelta(delta);
		} 
		else if (delta.function_call) {
			await this.handleFunctionCallDelta(delta);
		}
	
		if (this.isDone) {
			await this.flushSegment();
		}
	}
 
	private async handleContentDelta(delta: Delta) {
		this.content += delta.content ?? "";
		if (delta.content?.indexOf("\n") !== -1) {
			await this.flushSegment();
		}
	}

	private async handleFunctionCallDelta(delta: Delta) {
		if (this.functionCall.name === "") {
			this.functionCall.name = delta.function_call.name;
		}
		else {
			this.functionCall.arguments += delta.function_call.arguments;
		}
	}

	private async flushSegment() {
		const message = this.functionCall.name !== ""
			? this.chatMessageBuilder.buildChatMessageWithFunctionCall(this.id, this.functionCall)
			: this.chatMessageBuilder.buildChatMessageWithTextContent(this.id, this.content);

		await this.onSegmentReceived({
			message,
			isLastSegment: this.isDone,
		});

		this.content = "";
		this.functionCall.name = "";
		this.functionCall.arguments = "";
	}
}

export default ChatCompletionDeltaProcessor;
