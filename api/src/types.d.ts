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
	id: string;
	messages: ChatMessage[];
}

interface ChatMessage extends Message {
	id: string;
	timestamp: number;
}
