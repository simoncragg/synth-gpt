
import { 
	ChatCompletionMessage
} from "@clients/openaiApiClient";

import AttachmentMapper from "./AttachmentMapper";
import { ChatMessage, FunctionResult } from "src/types";

class ChatCompletionMessageMapper {

	private attachmentMapper: AttachmentMapper;

	constructor() {
		this.attachmentMapper = new AttachmentMapper();
	}

	public mapFromChatMessages(chatMessages: ChatMessage[]): ChatCompletionMessage[] {
		return chatMessages
			.filter((msg) => msg.content.type !== "codingActivity" && msg.content.type !== "webActivity")
			.map((msg) => this.mapFromChatMessage(msg));
	}

	private mapFromChatMessage(chatMessage: ChatMessage): ChatCompletionMessage {
		return chatMessage.role === "function"
			? this.mapFunctionMessage(chatMessage)
			: this.mapTextMessage(chatMessage);
	}

	private mapFunctionMessage(message: ChatMessage): ChatCompletionMessage {
		const functionResult = message.content.value as FunctionResult;
		return {
			role: message.role,
			name: functionResult.name,
			content: functionResult.result,
		};
	}

	private mapTextMessage(message: ChatMessage): ChatCompletionMessage {
		const content = this.mapToMarkdownString(message);
		return {
			role: message.role,
			content,
		};
	}

	private mapToMarkdownString(message: ChatMessage): string {
		const parts = [`${message.content.value}\n\n`];
		for (const attachment of message.attachments) {
			parts.push(this.attachmentMapper.mapToMarkdownString(attachment));
		}
		return parts.join("");
	}
}

export default ChatCompletionMessageMapper;
