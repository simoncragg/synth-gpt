import { ChatCompletionMessage } from "@clients/openaiApiClient";

import AttachmentMapper from "./AttachmentMapper";

import { 
	ChatMessage, 
	CodingActivity, 
	ReadingWebSearchResultsAction, 
	WebActivity
} from "src/types";

class ChatCompletionMessageMapper {

	private attachmentMapper: AttachmentMapper;

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
		if (message.content.type === "codingActivity") {
			return this.mapFromCodingActivity(message.content.value as CodingActivity);
		}

		if (message.content.type === "webActivity") {
			return this.mapFromWebActivity(message.content.value as WebActivity);
		}
		
		return [{
			role: "assistant",
			content: message.content.value as string
		}];
	}

	private mapFromCodingActivity(codingActivity: CodingActivity): ChatCompletionMessage[] {
		const { code, executionSummary } = codingActivity;
		const { success, result, error } = executionSummary;
		return [
			{
				role: "assistant",
				content: null,
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

	private mapFromWebActivity(webActivity: WebActivity): ChatCompletionMessage[] {
		const { searchTerm: search_term, actions } = webActivity;
		const readingResults = actions.find(action => action.type === "readingResults") as ReadingWebSearchResultsAction;
		const searchResults = readingResults.results;
		return [
			{
				role: "assistant",
				content: null,
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
		const parts = [`${message.content.value}\n\n`];
		for (const attachment of message.attachments) {
			parts.push(this.attachmentMapper.mapToMarkdownString(attachment));
		}
		return parts.join("");
	}
}

export default ChatCompletionMessageMapper;
