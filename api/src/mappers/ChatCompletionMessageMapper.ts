import { ChatCompletionMessage } from "@clients/openaiApiClient";

import type { 
	ChatMessage, 
	CodingActivity, 
	ReadingWebSearchResultsAction, 
	WebActivity
} from "@src/types";

import AttachmentMapper from "./AttachmentMapper";

class ChatCompletionMessageMapper {

	private readonly attachmentMapper: AttachmentMapper;

	constructor() {
		this.attachmentMapper = new AttachmentMapper();
	}

	mapFromChatMessage(chatMessage: ChatMessage): ChatCompletionMessage[] {
		if (chatMessage.role === "user") {
			return [this.mapFromUserMessage(chatMessage)];
		}

		if (chatMessage.role === "assistant") {
			return this.mapFromAssistantMessage(chatMessage);
		}

		throw new Error(`Cannot map ChatMessage with role '${chatMessage.role}' to ChatCompletionMessage`);
	}

	private mapFromUserMessage(message: ChatMessage): ChatCompletionMessage {
		const content = this.mapToMarkdownString(message);
		return {
			role: message.role,
			content,
		} as ChatCompletionMessage;
	}

	private mapFromAssistantMessage(message: ChatMessage): ChatCompletionMessage[] {
		if (message.activity?.type === "codingActivity") {
			return this.mapFromCodingActivity(message.activity.value as CodingActivity, message.content);
		}

		if (message.activity?.type === "webActivity") {
			return this.mapFromWebActivity(message.activity.value as WebActivity, message.content);
		}
		
		return [{
			role: "assistant",
			content: message.content,
		}];
	}

	private mapFromCodingActivity(codingActivity: CodingActivity, content?: string): ChatCompletionMessage[] {
		const { code, executionSummary } = codingActivity;
		const { success, result, error } = executionSummary;
		return [
			{
				role: "assistant",
				content: content ?? "",
				function_call: {
					name: "execute_python_code",
					arguments: JSON.stringify({ code })
				}
			},
			{
				role: "function",
				name: "execute_python_code",
				content: success ? result : error
			},
		];
	}

	private mapFromWebActivity(webActivity: WebActivity, content?: string): ChatCompletionMessage[] {
		const { searchTerm: search_term, actions } = webActivity;
		const readingResults = actions.find(action => action.type === "readingResults") as ReadingWebSearchResultsAction;
		const searchResults = readingResults.results;
		return [
			{
				role: "assistant",
				content: content ?? "",
				function_call: {
					name: "perform_web_search",
					arguments: JSON.stringify({search_term}),
				}
			},
			{
				role: "function",
				name: "perform_web_search",
				content: JSON.stringify({searchResults}),
			},
		];
	}

	private mapToMarkdownString(message: ChatMessage): string {
		const parts = [`${message.content}\n\n`];
		for (const attachment of message.attachments) {
			parts.push(this.attachmentMapper.mapToMarkdownString(attachment));
		}
		return parts.join("");
	}
}

export default ChatCompletionMessageMapper;
