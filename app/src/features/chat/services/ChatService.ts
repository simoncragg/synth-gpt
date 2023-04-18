export default class ChatService {
	private socket: WebSocket | null = null;

	// eslint-disable-next-line prettier/prettier
	constructor(private readonly chatId: string) { }

	connect(): void {
		const socketUrl = "ws://localhost:4001";
		this.socket = new WebSocket(socketUrl);
		this.socket.addEventListener("open", () => {
			console.log("WebSocket connection opened");
		});
		this.socket.addEventListener("message", (event) => {
			const payload = JSON.parse(event.data);
			this.onMessageReceived(payload);
		});
	}

	send(
		message: ChatMessage,
		callback?: (payload: SendMessageResponse) => void
	): void {
		if (!this.socket) {
			const error = "WebSocket connection not established";
			console.log(error, { level: "error" });
			throw new Error(error);
		}
		const content = {
			chatId: this.chatId,
			message,
		} as SendMessageRequest;

		const payload = { action: "handleUserMessage", content };
		console.log("Sending payload", payload);
		this.socket.send(JSON.stringify(payload));

		if (callback) {
			this.onMessageReceived = callback;
		}
	}

	private onMessageReceived(payload: SendMessageResponse): void {
		// default callback implementation
		console.log("Default message received handler:", payload);
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
			console.log("WebSocket connection closed");
		}
	}
}
