import { v4 as uuidv4 } from "uuid";

import type { ChatMessage } from "@src/types";
import type { Delta, FunctionCall } from "@clients/openaiApiClient";
import type { MessageSegmentCallbackType } from "./ChatCompletionService";

import ChatMessageBuilder from "@builders/ChatMessageBuilder";

class ChatCompletionDeltaProcessor {

	private readonly onSegmentReceived: MessageSegmentCallbackType;
	private readonly chatMessageBuilder: ChatMessageBuilder;
    
	private id: string;
	private content: string;
	private functionCall: FunctionCall & { argumentsSegment: string };
	private isDone: boolean;
    
	constructor(onSegmentReceived: MessageSegmentCallbackType) {
		this.onSegmentReceived = onSegmentReceived;
		this.chatMessageBuilder = new ChatMessageBuilder();

		this.id = uuidv4();
		this.content = "";
		this.functionCall = {
			name: "",
			arguments: "",
			argumentsSegment: ""
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
			this.functionCall.name += delta.function_call.name;
			await this.flushSegment();
		}
		else if (delta.function_call.arguments) {
			
			this.functionCall.arguments += delta.function_call.arguments;
			this.functionCall.argumentsSegment += delta.function_call.arguments;
			
			if (this.functionCall.name === "execute_python_code" && 
                delta.function_call.arguments.indexOf("\\n") > -1)
			{
				await this.flushSegment();
			}
		}
	}

	private async flushSegment() {

		const isFunctionCall = this.functionCall.name !== "";

		const message = isFunctionCall
			? this.buildChatMessageWithFunctionCall()
			: this.buildChatMessageWithTextContent();

		await this.onSegmentReceived({
			message,
			isLastSegment: this.isDone,
		});

		this.content = "";
		this.functionCall.argumentsSegment = "";

		if (this.isDone) {
			this.functionCall.name = "";
			this.functionCall.arguments = "";
		}
	}

	private buildChatMessageWithTextContent(): ChatMessage {
		return this.chatMessageBuilder.buildChatMessageWithTextContent(this.id, this.content);
	}

	private buildChatMessageWithFunctionCall(): ChatMessage {

		if (this.functionCall.name === "execute_python_code") {
			return this.buildChatMessageWithCodingActivity();
		}
		
		if (this.functionCall.name === "perform_web_search") {
			return this.buildChatMessageWithWebActivity();
		}
	}

	private buildChatMessageWithCodingActivity(): ChatMessage {

		const code = this.isDone
			? JSON.parse(this.functionCall.arguments.replace(/\n/g, "")).code
			: this.functionCall.argumentsSegment.replace(/^\s*{\s*"code":\s*"/, "").trim().replace(/\\n/g, "\n");

		return this.chatMessageBuilder.buildChatMessageWithContent(this.id, {
			type: "codingActivity",
			value: {
				code,
				currentState: "working",			
			},
		});
	}

	private buildChatMessageWithWebActivity(): ChatMessage {

		const searchTerm = this.isDone
			? JSON.parse(this.functionCall.arguments.replace(/\n/g, "")).search_term
			: "";

		return this.chatMessageBuilder.buildChatMessageWithContent(this.id, {
			type: "webActivity",
			value: {
				searchTerm,
				currentState: "searching",
				actions: [],
			},
		});
	}
}

export default ChatCompletionDeltaProcessor;
