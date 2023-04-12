interface DeleteChatResponse {
	chatId: string;
	isSuccess: boolean;
	error?: string;
}

interface GenerateTitleResponseBody {
	chatId: string;
	title: string;
}

interface HandleMessageResponseBody {
	message: ChatMessage;
}
interface TextToSpeechResponseBody {
	transcript: string;
	audioUrl: string;
}

interface ErrorResponseBody {
	error: string;
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
