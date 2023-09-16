import type { ChatMessage, Content  } from "@src/types";

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

	buildChatMessageWithContent(
		id: string, 
		content: Content
	): ChatMessage {
		return {
			id,
			role: "assistant",
			attachments: [],
			content,
			timestamp: Date.now(),
		};
	}
}

export default ChatMessagesBuilder;
