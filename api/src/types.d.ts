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

interface HandleMessageResponseBody extends BaseResponseBody {
	message: ChatMessage;
}

interface TextToSpeechResponseBody extends BaseResponseBody {
	transcript: string;
	audioUrl: string;
}

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
