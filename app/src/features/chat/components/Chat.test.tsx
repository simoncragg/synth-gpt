import type { UseWebSocketProps } from "../hooks/useWebSocket";

import userEvent from "@testing-library/user-event";
import { Mock, vi } from "vitest";
import { PreloadedState } from "@reduxjs/toolkit";
import { act, fireEvent } from "@testing-library/react";
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
		mockConnect.mockClear();

		mockDisconnect.mockImplementationOnce(() => {
			onConnectionClosedCallback({ code: 1006 } as CloseEvent);
		});
		act(() => mockDisconnect());

		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledTimes(1);
		});
	});

	it("should not attempt to establish a new connection when the websocket is disconnected with close code 1000 (Normal Closure)", async () => {
		setupSpeechRecognitionHook(transcript);
		renderChat(chatId);
		mockConnect.mockClear();

		mockDisconnect.mockImplementation(() => {
			onConnectionClosedCallback({ code: 1000 } as CloseEvent);
		});
		act(() => mockDisconnect());

		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledTimes(0);
		});
	});

	it("should send message when send button is pressed", () => {
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
					attachments: [],
					content: {
						type: "text",
						value: transcript,
					},
					timestamp: expect.any(Number),
				},
			},
		});
	});

	it("should render user message in chat log and auto-scroll the page", () => {
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
						attachments: [],
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

	it("should render code attachment in chat log when attached", async () => {
		setupSpeechRecognitionHook(transcript);

		const { getByTestId } = await renderChatAndAttachCodeSnippet(
			chatId,
			"console.log('Hello World!');"
		);

		const chatLog = getByTestId("chat-log");
		const code = within(chatLog).getByText(/^'Hello World!'$/i);
		expect(code).toBeInTheDocument();
	});

	it("should render file attachment in chat log when attached", async () => {
		setupSpeechRecognitionHook(transcript);

		const file = new File(["hello"], "hello.txt", { type: "text/plain" });
		const { getByTestId } = await renderChatAndAttachFiles(chatId, [file]);
		
		const chatLog = getByTestId("chat-log");

		await waitFor(() => {
			const fileEl = within(chatLog).getByText(file.name);
			expect(fileEl).toBeInTheDocument()
		});
	});

	it("should send message with attached code snippet", async () => {
		setupSpeechRecognitionHook(transcript);

		const code = "console.log('Hello World!');";
		const { getByLabelText } = await renderChatAndAttachCodeSnippet(
			chatId,
			code
		);
	
		userEvent.click(getByLabelText("listen-send"));

		await waitFor(() => {
			expect(mockSend).toHaveBeenCalledWith({
				type: "userMessage" as const,
				payload: {
					chatId,
					userId,
					message: {
						id: expect.any(String),
						role: "user",
						attachments: [{
								id: expect.any(String),
								type: "CodeSnippet",
								content: {
									language: "typescript",
									code,
								},
							},
						],
						content: {
							type: "text",
							value: transcript,
						},
						timestamp: expect.any(Number),
					},
				},
			});
		});
	});

	it("should allow user to add file attachments and display", async () => {
		setupSpeechRecognitionHook(transcript);

		const expectedFiles = [
			{
				name: "hello.txt",
				contentType: "text/plain",
				contents: "hello world",
				extension: "txt",
				size: 11,
			},
			{
				name: "data.csv",
				contentType: "text/plain",
				contents: "name,age",
				extension: "csv",
				size: 8,
			},
		] as AttachedFile[];

		const files = expectedFiles.map(f => new File([f.contents], f.name, { type: f.contentType }));
		const { getByText, getByLabelText } = await renderChatAndAttachFiles(chatId, files);

		await waitFor(() => {
			for (const file of files) {
				expect(getByText(file.name)).toBeInTheDocument();
			}
		});

		userEvent.click(getByLabelText("listen-send"));

		expect(mockSend).toHaveBeenCalledWith({
			type: "userMessage" as const,
			payload: {
				chatId,
				userId,
				message: {
					id: expect.any(String),
					role: "user",
					attachments: 
						expectedFiles.map(f => ({
							id: expect.any(String),
							type: "File",
							file: {
								name: f.name,
								contentType: f.contentType,
								contents: f.contents,
								extension: f.extension,
								size: f.size,
							},
						})),
					content: {
						type: "text",
						value: transcript,
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

	const renderChatAndAttachCodeSnippet = async (chatId: string, codeToAttach: string) => {
		const renderResult = renderChat(chatId);
		const { getByLabelText, getByRole } = renderResult;
		userEvent.click(getByLabelText("attachments-menu"));
		userEvent.click(getByLabelText("attach-code"));
		await waitFor(() => userEvent.paste(getByLabelText("input-code"), codeToAttach));
		userEvent.click(getByRole("button", { name: /^attach$/i }));
		return renderResult;
	};

	const renderChatAndAttachFiles = async (chatId: string, files: File[]) => {
		const renderResult = renderChat(chatId);
		const { getByLabelText, getByTestId } = renderResult;
		userEvent.click(getByLabelText("attachments-menu"));
		userEvent.click(getByLabelText("attach-file"));
		
		await waitFor(() =>	{
			const fileInput = getByTestId("file-input");
			userEvent.upload(fileInput, files);
		});

		return renderResult;
	};
});
