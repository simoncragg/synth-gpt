import { v4 as uuidv4 } from "uuid";

import type { ChatMessage } from "@src/types";
import type { Delta, FunctionCall } from "@clients/openaiApiClient";
import type { MessageSegmentCallbackType } from "./ChatCompletionService";

import ChatMessageBuilder from "@builders/ChatMessageBuilder";

class ChatCompletionDeltaProcessor {

	private readonly onSegmentReceived: MessageSegmentCallbackType;
	private readonly chatMessageBuilder: ChatMessageBuilder;
    
	private chatMessageId: string;
	private content: string;
	private functionCall: FunctionCall & { argumentsSegment: string };
	private isLastDelta: boolean;
    
	constructor(onSegmentReceived: MessageSegmentCallbackType) {
		this.onSegmentReceived = onSegmentReceived;
		this.chatMessageBuilder = new ChatMessageBuilder();

		this.chatMessageId = uuidv4();
		this.content = "";
		this.functionCall = {
			name: "",
			arguments: "",
			argumentsSegment: ""
		};
		this.isLastDelta = false;
	}

	async processDelta(delta: Delta, finishReason: string) {
		this.isLastDelta = finishReason !== null;
		
		if (this.isLastDelta) {
			await this.flushSegment();
			return;
		}

		if (delta.content) {
			await this.handleContentDelta(delta);
		}
		
		if (delta.function_call) {
			if (this.isFlushableContent()) await this.flushSegment();
			await this.handleFunctionCallDelta(delta);
		}
	}

	private isFlushableContent() {
		return this.content !== "";
	}
 
	private async handleContentDelta(delta: Delta) {
		this.appendContent(delta?.content);
		if (this.containsNewLine(delta?.content)) await this.flushSegment();
	}

	private appendContent(content?: string) {
		if (content) this.content += content;
	}

	private containsNewLine(content?: string): boolean {
		return content && content?.includes("\n");
	}

	private async handleFunctionCallDelta(delta: Delta) {
		this.setFunctionCallName(delta.function_call?.name);
		this.appendFunctionCallArguments(delta.function_call?.arguments);
		if (this.shouldFlushFunctionCall()) await this.flushSegment();
	}

	private setFunctionCallName(name?: string) {
		if (name && this.functionCall.name === "") {
			this.functionCall.name = name;
		}		
	}

	private appendFunctionCallArguments(args: string) {
		if (args) {
			const deltaArgs = this.escapeNewLines(args);
			this.functionCall.arguments += deltaArgs;
			this.functionCall.argumentsSegment += deltaArgs;
		}
	}

	private shouldFlushFunctionCall() {
		return this.isExecutePythonCode() && this.functionCall.argumentsSegment.includes("\\n");
	}

	private async flushSegment() {

		const message = this.isFunctionCall()
			? this.buildChatMessageWithFunctionCall()
			: this.buildChatMessageWithContent();

		await this.onSegmentReceived({
			message,
			isLastSegment: this.isLastDelta,
		});

		this.content = "";
		this.functionCall.argumentsSegment = "";

		if (this.isLastDelta) {
			this.functionCall.name = "";
			this.functionCall.arguments = "";
		}
	}

	private isFunctionCall(): boolean {
		return this.functionCall.name !== "";
	}

	private buildChatMessageWithContent(): ChatMessage {
		return this.chatMessageBuilder.buildChatMessageWithContent(
			this.chatMessageId, this.content
		);
	}

	private buildChatMessageWithFunctionCall(): ChatMessage {

		if (this.isExecutePythonCode()) {
			return this.buildChatMessageWithCodingActivity();
		}
		
		if (this.isPerformWebSearch()) {
			return this.buildChatMessageWithWebActivity();
		}
	}

	private isExecutePythonCode(): boolean {
		return this.functionCall.name === "execute_python_code";
	}

	private isPerformWebSearch(): boolean {
		return this.functionCall.name === "perform_web_search";
	}

	private buildChatMessageWithCodingActivity(): ChatMessage {

		const code = this.isLastDelta
			? this.extractCompletedCode()
			: this.extractIncompleteCode();

		return this.chatMessageBuilder.buildChatMessageWithActivity(this.chatMessageId, {
			type: "codingActivity",
			value: {
				code: this.unescapeNewLines(code),
				currentState: "working",			
			},
		});
	}

	private extractCompletedCode(): string {
		console.log("getCompletedCode", this.functionCall.arguments);
		return JSON.parse(
			this.cleanJsonString(this.functionCall.arguments)
		).code;
	}

	private extractIncompleteCode(): string {
		return this.functionCall.argumentsSegment
			.replace(/^\s*{\s*"code":\s*"/, "")
			.trim();
	}

	private buildChatMessageWithWebActivity(): ChatMessage {

		const searchTerm = this.isLastDelta
			? this.extractSearchTerm()
			: "";
		
		return this.chatMessageBuilder.buildChatMessageWithActivity(this.chatMessageId, {
			type: "webActivity",
			value: {
				searchTerm,
				currentState: "searching",
				actions: [],
			},
		});
	}

	private extractSearchTerm(): string {
		return JSON.parse(
			this.cleanJsonString(this.functionCall.arguments)
		).search_term;
	}

	private cleanJsonString(prettifiedJsonStr: string): string {
		return prettifiedJsonStr
			.replace(/^{\s*\\n\s*"/, "{ \"")
			.replace(/\s*\\n\s*}$/, " }");
	}

	private escapeNewLines(input: string): string {
		return input.replace(/(?<!\\)\n/g, "\\n");
	}

	private unescapeNewLines(input: string): string {
		return input.replaceAll("\\n", "\n");
	}
}

export default ChatCompletionDeltaProcessor;
