interface Chat {
  id: string;
  messages: ChatMessage[];
}

type SenderType = "user" | "bot";

interface ChatMessage {
  id: string;
  sender: SenderType;
  message: string;
  timestamp: number;
}

interface SendMessageRequest {
  chatId: string;
  message: string;
}

interface SendMessageResponse {
  message: string;
}

interface TextToSpeechRequest {
  transcript: string;
}

interface TextToSpeechResponse {
  transcript: string;
  audioUrl: string;
}
