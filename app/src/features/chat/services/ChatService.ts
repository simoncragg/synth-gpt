export default class ChatService {
	private socket: WebSocket | null = null;
	private readonly chatId: string;
	private readonly onMessageReceived: (message: WebSocketMessage) => void;

	constructor(
		chatId: string,
		onMessageReceived: (message: WebSocketMessage) => void
	) {
		this.chatId = chatId;
		this.onMessageReceived = onMessageReceived;
	}

	connect(): void {
		const socketUrl = "ws://localhost:4001";
		this.socket = new WebSocket(socketUrl);
		this.socket.addEventListener("open", () => {
			console.log("WebSocket connection opened");
		});
		this.socket.addEventListener("message", (event) => {
			const message = JSON.parse(event.data);
			this.onMessageReceived(message);
		});
	}

	send(message: WebSocketMessage): void {
		if (!this.socket) {
			const error = "WebSocket connection not established";
			console.log(error, { level: "error" });
			throw new Error(error);
		}
		console.log("Sending message", message);
		this.socket.send(JSON.stringify(message));
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
			console.log("WebSocket connection closed");
		}
	}
}
