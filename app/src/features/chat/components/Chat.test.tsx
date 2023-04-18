import { fireEvent } from "@testing-library/react";
import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";
import { within } from "@testing-library/dom";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";
import { useTextToSpeechMutation } from "../../../services/chatApi";
import { useSpeechRecognition } from "react-speech-recognition";
import Chat from "./Chat";
import ChatService from "../services/ChatService";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("../../../services/chatApi", () => ({
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

jest.mock("../services/ChatService");

describe("Chat", () => {
	const chatId = uuidv4();
	const transcript = "this is a test";
	const chatServiceMock = mocked(ChatService);

	it("should establish a connection for chat when mounted", () => {
		setupMocks(transcript);
		renderChat(chatId);
		expect(chatServiceMock).toHaveBeenCalledWith(chatId);
		expect(chatServiceMock.prototype.connect).toHaveBeenCalled();
	});

	it("should invoke disconnect when unmounted", () => {
		setupMocks(transcript);
		const { unmount } = renderChat(chatId);
		unmount();
		expect(chatServiceMock.prototype.disconnect).toHaveBeenCalled();
	});

	it("should invoke send passing composed message when send button is pressed", () => {
		setupMocks(transcript);

		const { getByLabelText } = renderChat(chatId);
		fireEvent.click(getByLabelText("listen-send"));

		expect(chatServiceMock.prototype.send).toHaveBeenCalledWith(
			{
				id: expect.any(String),
				role: "user",
				content: transcript,
				timestamp: expect.any(Number),
			},
			expect.any(Function)
		);
	});

	it("should render user message in chat log and auto-scroll page", () => {
		setupMocks(transcript);

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
		setupMocks(transcript);

		const { getByLabelText } = renderChatAndAddAttachment(
			chatId,
			"console.log('Hello World!');"
		);
		fireEvent.click(getByLabelText("listen-send"));

		expect(chatServiceMock.prototype.send).toHaveBeenCalledWith(
			{
				id: expect.any(String),
				role: "user",
				content: `${transcript}\n\`\`\`typescript\nconsole.log('Hello World!');\n\`\`\`\n`,
				timestamp: expect.any(Number),
			},
			expect.any(Function)
		);
	});

	const setupMocks = (transcript: string, listening = true) => {
		setupSpeechRecognitionHook(transcript, listening);
		useTextToSpeechMutation.mockImplementation(() => [
			jest.fn(),
			{ isLoading: false },
		]);
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
