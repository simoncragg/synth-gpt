import type { UseWebSocketProps } from "../hooks/useWebSocket";

import { Mock, vi } from "vitest";
import { PreloadedState } from "@reduxjs/toolkit";
import { fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useSpeechRecognition } from "react-speech-recognition";
import { v4 as uuidv4 } from "uuid";
import { waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";

import Chat from "./Chat";
import { RootStateType } from "../../../store";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockConnect = vi.fn();
const mockSend = vi.fn();
const mockDisconnect = vi.fn();

let onConnectionClosedCallback: (event: CloseEvent) => void;

vi.mock("../hooks/useWebSocket", () => ({
	__esModule: true,
	default: ({ onConnectionClosed }: UseWebSocketProps) => {
		onConnectionClosedCallback = onConnectionClosed;
		return {
			connect: mockConnect,
			send: mockSend,
			disconnect: mockDisconnect,
		};
	},
}));

vi.mock("react-speech-recognition", () => ({
	__esModule: true,
	useSpeechRecognition: vi.fn(() => ({
		transcript: "",
		listening: false,
		browserSupportsSpeechRecognition: true,
		resetTranscript: vi.fn(),
	})),
	default: {
		startListening: vi.fn(),
		stopListening: vi.fn(),
	},
}));

vi.mock("../../auth/hooks/useAuth", () => ({
	__esModule: true,
	default: () => ({
		userId: "user-123",
		accessToken: "access-token-123",
	}),
}));

const server = setupServer();

describe("Chat", () => {
	const tokenId = "token-123";
	const userId = "user-123";
	const chatId = uuidv4();
	const transcript = "this is a test";

	beforeAll(() => {
		server.listen({
			onUnhandledRequest(req) {
				console.error(
					"Found an unhandled %s request to %s",
					req.method,
					req.url.href
				);
			},
		});
		server.use(
			rest.post("*/auth/createWsToken", (req, res, ctx) => {
				return res(
					ctx.json({
						tokenId: "token-123",
						expiryTime: Date.now() + 30000,
						success: true,
					})
				);
			})
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		server.close();
	});

	it("should establish a connection for chat when mounted", async () => {
		setupSpeechRecognitionHook(transcript);
		renderChat(chatId);
		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledWith(tokenId);
		});
	});

	it("should invoke disconnect when unmounted", () => {
		setupSpeechRecognitionHook(transcript);
		const { unmount } = renderChat(chatId);
		unmount();
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("should attempt to establish a new connection when the websocket is unexceptedly disconnected", async () => {
		setupSpeechRecognitionHook(transcript);
		renderChat(chatId);

		mockDisconnect.mockImplementation(() => {
			onConnectionClosedCallback({ code: 1006 } as CloseEvent);
		});
		mockDisconnect();

		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledTimes(2);
		});
	});

	it("should not attempt to establish a new connection when the websocket is disconnected with close code 1000 (Normal Closure)", async () => {
		setupSpeechRecognitionHook(transcript);
		renderChat(chatId);

		mockDisconnect.mockImplementation(() => {
			onConnectionClosedCallback({ code: 1005 } as CloseEvent);
		});
		mockDisconnect();

		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledTimes(1);
		});
	});

	it("should invoke send passing composed message when send button is pressed", () => {
		setupSpeechRecognitionHook(transcript);

		const { getByLabelText } = renderChat(chatId);
		fireEvent.click(getByLabelText("listen-send"));

		expect(mockSend).toHaveBeenCalledWith({
			type: "userMessage" as const,
			payload: {
				chatId,
				userId,
				message: {
					id: expect.any(String),
					role: "user" as const,
					content: {
						type: "text",
						value: transcript,
					},
					timestamp: expect.any(Number),
				},
			},
		});
	});

	it("should render user message in chat log and auto-scroll page", () => {
		setupSpeechRecognitionHook(transcript);

		const { getByTestId } = renderChat(chatId, {
			chat: {
				chatId,
				title: newChatText,
				transcript,
				attachments: [],
				messages: [
					{
						id: uuidv4(),
						role: "user" as const,
						content: {
							type: "text",
							value: transcript,
						},
						timestamp: Date.now(),
					},
				],
			},
		});

		const chatLog = getByTestId("chat-log");
		expect(within(chatLog).getByText(transcript)).toBeInTheDocument();

		const scrollTarget = getByTestId("scroll-target");
		expect(scrollTarget.scrollIntoView).toHaveBeenCalledWith(
			expect.objectContaining({
				behavior: "smooth",
			})
		);
	});

	it("should add code to chat log when attached", () => {
		setupSpeechRecognitionHook(transcript);

		const { getByTestId } = renderChatAndAddAttachment(
			chatId,
			"console.log('Hello World!');"
		);

		const chatLog = getByTestId("chat-log");
		const code = within(chatLog).getByText(/^'Hello World!'$/i);
		expect(code).toBeInTheDocument();
	});

	it("should send the composed message when send button is pressed", () => {
		setupSpeechRecognitionHook(transcript);

		const { getByLabelText } = renderChatAndAddAttachment(
			chatId,
			"console.log('Hello World!');"
		);
		fireEvent.click(getByLabelText("listen-send"));

		expect(mockSend).toHaveBeenCalledWith({
			type: "userMessage" as const,
			payload: {
				chatId,
				userId,
				message: {
					id: expect.any(String),
					role: "user",
					content: {
						type: "text",
						value: `${transcript}\n\`\`\`typescript\nconsole.log('Hello World!');\n\`\`\`\n`,
					},
					timestamp: expect.any(Number),
				},
			},
		});
	});

	const setupSpeechRecognitionHook = (transcript: string, listening = true) => {
		const useSpeechRecognitionMock = useSpeechRecognition as Mock;
		useSpeechRecognitionMock.mockReturnValue({
			transcript,
			listening,
			browserSupportsSpeechRecognition: true,
			resetTranscript: vi.fn(),
		});
	};

	const renderChat = (
		chatId: string,
		initialState?: PreloadedState<RootStateType>
	) => {
		return renderWithProviders(<Chat />, {
			preloadedState: initialState ?? {
				chat: {
					chatId,
					title: newChatText,
					transcript: "",
					attachments: [],
					messages: [],
				},
			},
		});
	};

	const renderChatAndAddAttachment = (chatId: string, codeToAttach: string) => {
		const renderResult = renderChat(chatId);
		const { getByLabelText, getByRole } = renderResult;
		fireEvent.click(getByLabelText("attachments-menu"));
		fireEvent.click(getByLabelText("attach-code"));
		fireEvent.change(getByLabelText("input-code"), {
			target: { value: codeToAttach },
		});
		fireEvent.click(getByRole("button", { name: /^attach$/i }));

		return renderResult;
	};
});
