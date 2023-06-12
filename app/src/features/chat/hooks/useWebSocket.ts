import { useRef } from "react";

const useWebSocket = ({
	onMessageReceived,
	onConnectionClosed,
}: ChatSocketProps) => {
	const socketRef = useRef<WebSocket | null>(null);

	const connect = (tokenId: string): void => {
		const baseSocketUrl = process.env.SOCKET_URL ?? "ws://localhost:4001/";
		const socketUrl = `${baseSocketUrl}?tokenId=${tokenId}`;
		const socket = new WebSocket(socketUrl);
		socket.addEventListener("open", () => {
			console.log("WebSocket connection opened");
		});
		socket.addEventListener("message", (event: MessageEvent) => {
			onMessageReceived(JSON.parse(event.data));
		});
		socket.addEventListener("close", (event: CloseEvent) => {
			console.log("WebSocket connection closed", event);
			onConnectionClosed(event);
		});
		socketRef.current = socket;
	};

	const send = (message: WebSocketMessage): void => {
		if (!socketRef.current) {
			const error = "WebSocket connection not established";
			console.error(error);
			throw new Error(error);
		}
		console.log("Sending message", message);
		socketRef.current.send(JSON.stringify(message));
	};

	const disconnect = (): void => {
		if (socketRef.current) {
			socketRef.current.close(1000, "Normal Closure");
			socketRef.current = null;
		}
	};

	return { connect, send, disconnect };
};

export interface ChatSocketProps {
	onMessageReceived: (message: WebSocketMessage) => void;
	onConnectionClosed: (event: CloseEvent) => void;
}

export default useWebSocket;
