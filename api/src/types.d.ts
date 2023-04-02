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
	messages: ChatMessage[];
	createdTime: number;
	updatedTime: number;
}

interface ChatMessage extends Message {
	id: string;
	timestamp: number;
}
