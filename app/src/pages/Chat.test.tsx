import { v4 as uuidv4 } from "uuid";
import { fireEvent } from "@testing-library/react";
import { within } from "@testing-library/dom";
import { renderWithProviders } from "../utils/test-utils";
import {
	useSendMessageMutation,
	useTextToSpeechMutation,
} from "../services/chatApi";
import { useSpeechRecognition } from "react-speech-recognition";
import Chat from "./Chat";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("../services/chatApi", () => ({
	useSendMessageMutation: jest.fn(),
	useTextToSpeechMutation: jest.fn(),
	chatApi: {
		reducer: {},
		middleware: [],
	},
}));

jest.mock("react-speech-recognition", () => ({
	__esModule: true,
	useSpeechRecognition: jest.fn(),
	default: {
		startListening: jest.fn(),
		stopListening: jest.fn(),
	},
}));

const chatId = uuidv4();
const transcript = "this is a test";

describe("Chat", () => {
	it("should invoke sendMessage passing chatId and composed message when send button is pressed", () => {
		const { sendMessageMock } = setupMocks(transcript);

		const { getByLabelText } = renderChat(chatId);
		fireEvent.click(getByLabelText("listen-send"));

		expect(sendMessageMock).toHaveBeenCalledWith({
			chatId,
			message: expect.objectContaining({
				id: expect.any(String),
				role: "user",
				content: transcript,
				timestamp: expect.any(Number),
			}),
		});
	});

	it("should render user message in chat log and auto-scroll page", () => {
		setupMocks(transcript);
		const { getByTestId } = renderChat(chatId, {
			chat: {
				id: chatId,
				transcript,
				attachments: [],
				composedMessage: null,
				messages: [
					{
						id: uuidv4(),
						role: "user" as const,
						content: transcript,
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
		setupMocks(transcript);

		const { getByTestId } = renderChatAndAddAttachment(
			chatId,
			"console.log('Hello World!');"
		);

		const chatLog = getByTestId("chat-log");
		const code = within(chatLog).getByText(/^'Hello World!'$/i);
		expect(code).toBeInTheDocument();
	});

	it("should send the composed message when send button is pressed", () => {
		const { sendMessageMock } = setupMocks(transcript);

		const { getByLabelText } = renderChatAndAddAttachment(
			chatId,
			"console.log('Hello World!');"
		);
		fireEvent.click(getByLabelText("listen-send"));

		expect(sendMessageMock).toHaveBeenCalledWith({
			chatId,
			message: expect.objectContaining({
				id: expect.any(String),
				role: "user",
				content: `${transcript}\n\`\`\`typescript\nconsole.log('Hello World!');\n\`\`\`\n`,
				timestamp: expect.any(Number),
			}),
		});
	});

	const setupMocks = (transcript: string, listening = true) => {
		const sendMessageMock = jest.fn();
		setupSpeechRecognitionHook(transcript, listening);
		useSendMessageMutation.mockImplementation(() => [
			sendMessageMock,
			{ isLoading: false },
		]);
		useTextToSpeechMutation.mockImplementation(() => [
			jest.fn(),
			{ isLoading: false },
		]);
		return { sendMessageMock };
	};

	const setupSpeechRecognitionHook = (
		transcript: string,
		listening: boolean
	) => {
		useSpeechRecognition.mockReturnValue({
			transcript,
			listening,
			browserSupportsSpeechRecognition: true,
			resetTranscript: jest.fn(),
		});
	};

	const renderChat = (
		chatId: string,
		initialState?: PreloadedState<RootState>
	) => {
		return renderWithProviders(<Chat />, {
			preloadedState: initialState ?? {
				chat: {
					id: chatId,
					transcript: "",
					attachments: [],
					composedMessage: null,
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
