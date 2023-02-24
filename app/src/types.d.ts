interface RootState {
  chat: Chat;
}

interface Chat {
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  sender: "synth" | "user";
  message: string;
}
