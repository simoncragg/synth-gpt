import type { Activity, ChatMessage  } from "@src/types";

class ChatMessagesBuilder {

	buildChatMessageWithContent(id: string, content: string): ChatMessage {
		return {
			id,
			role: "assistant",
			attachments: [],
			content,
			timestamp: Date.now(),
		};
	}

	buildChatMessageWithActivity(id: string, activity: Activity): ChatMessage {
		return {
			id,
			role: "assistant",
			attachments: [],
			activity,
			timestamp: Date.now(),
		};
	}
}

export default ChatMessagesBuilder;
