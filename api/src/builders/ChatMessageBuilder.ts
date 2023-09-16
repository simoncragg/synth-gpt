import { FunctionCall } from "@clients/openaiApiClient";
import { ChatMessage } from "src/types";

class ChatMessagesBuilder {

	buildChatMessageWithTextContent(
		id: string,
		content: string
	): ChatMessage {
		return {
			id,
			role: "assistant",
			attachments: [],
			content: {
				type: "text",
				value: content,
			},
			timestamp: Date.now(),
		};
	}

	buildChatMessageWithFunctionCall(
		id: string,
		functionCall: FunctionCall
	): ChatMessage {

		if (functionCall.name == "execute_python_code") {
			return this.buildCodingActivityMessage(id, functionCall);
		}

		if (functionCall.name == "perform_web_search") {
			return this.buildWebActivityMessage(id, functionCall);
		}
	}

	private buildCodingActivityMessage(
		id: string, 
		functionCall: FunctionCall,
	): ChatMessage {

		const code = JSON.parse(
			functionCall.arguments.replace(/\n/g, "")
		).code;

		return {
			id,
			role: "assistant",
			attachments: [],
			content: {
				type: "codingActivity",
				value: {
					code,
					currentState: "working",
				},
			},
			timestamp: Date.now(),
		};
	}

	private buildWebActivityMessage(
		id: string, 
		functionCall: FunctionCall
	): ChatMessage {
		
		const searchTerm = JSON.parse(
			functionCall.arguments
		).search_term;

		return {
			id,
			role: "assistant",
			attachments: [],
			content: {
				type: "webActivity",
				value: {
					searchTerm,
					currentState: "searching",
					actions: [],
				},
			},
			timestamp: Date.now(),
		};
	}
}

export default ChatMessagesBuilder;
