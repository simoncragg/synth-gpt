interface BaseResponseBody {
	success: boolean;
	error?: string;
}

interface GetChatResponseBody extends BaseResponseBody {
	chat: Chat;
}

interface GetChatsResponseBody extends BaseResponseBody {
	chats: ChatWithoutMessages[];
}

interface GenerateTitleResponseBody extends BaseResponseBody {
	chatId: string;
	title: string;
}

/* websocket messages */

type WebSocketMessageType = "assistantMessage" | "assistantAudio";

interface WebSocketMessage {
	type: WebSocketMessageType;
	payload: BasePayload;
}

interface BaseWebSocketMessagePayload {
	chatId: string;
}

interface AssistantMessagePayload extends BaseWebSocketMessagePayload {
	message: ChatMessage;
}

interface AssistantAudioPayload extends BaseWebSocketMessagePayload {
	transcript: string;
	audioUrl: string;
}

/* models */

interface Message {
	role: "system" | "user" | "assistant",
	content: string
}

interface Chat {
	chatId: string;
	title: string;
	userId: string;
	messages: ChatMessage[];
	createdTime: number;
	updatedTime: number;
}

type ChatWithoutMessages = Omit<Chat, "messages">;

interface ChatMessage extends Message {
	id: string;
	timestamp: number;
}
