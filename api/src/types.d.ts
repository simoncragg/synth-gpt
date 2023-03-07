interface HandleMessageResponseBody {
	message: string;
}
interface TextToSpeechResponseBody {
	transcript: string;
	audioUrl: string;
}

interface ErrorResponseBody {
	error: string;
}

interface ChatResponseBody {
	id: string;
	object: string;
	created: number;
	choices: Choice[];
	usage: Usage;
}

interface ChatChoice {
	index: number;
	message: Message;
	finish_reason: string;
}

interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface ChatUsage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

interface Chat {
	id: string;
	messages: ChatMessageWithTimestamp[];
}

interface ChatMessageWithTimestamp extends ChatMessage {
	timestamp: number;
}

