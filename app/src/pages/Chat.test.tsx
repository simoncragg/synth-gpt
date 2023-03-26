import { fireEvent } from "@testing-library/react";
import { within } from "@testing-library/dom";
import { renderWithProviders } from "../utils/test-utils";
import {
	useSendMessageMutation,
	useTextToSpeechMutation,
} from "../services/chatApi";
import { useSpeechRecognition } from "react-speech-recognition";
import { v4 as uuidv4 } from "uuid";
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
const sendMessageMock = jest.fn();

describe("Chat", () => {

	beforeEach(() => {
		sendMessageMock.mockReset();
	});

	it("should invoke sendMessage passing chatId and transcribed message when send button is pressed", () => {	

		setupMocks();

		const { getByLabelText } = renderChat();
		fireEvent.click(getByLabelText("listen-send"));

		expect(sendMessageMock).toHaveBeenCalledWith({
			chatId,
			message: transcript,
		});
	});

	it("should add sent message to chat log and auto-scroll page", () => {

		setupMocks();

		const { getByTestId } = renderChat();
		fireEvent.click(getByLabelText("listen-send"));

		const chatLog = getByLabelText("chat-log");
		expect(within(chatLog).getByText(transcript));

		const scrollTarget = getByTestId("scroll-target");
		expect(scrollTarget.scrollIntoView).toHaveBeenCalledWith(
			expect.objectContaining({
				behavior: "smooth",
			})
		);
	});

	it.only("should add code to chat log when attached", () => {
		setupMocks();

		const { getByTestId } = renderChatAndAddAttachment(
			"console.log('Hello World!');"
		);
		const chatLog = getByTestId("chat-log");
		const code = within(chatLog).getByText(/^'Hello World!'$/i);

		expect(code).toBeInTheDocument();
	});

	it.only("should send compiled message when send button is pressed", () => {

		setupMocks();

		const { getByLabelText } = renderChatAndAddAttachment(
			"console.log('Hello World!');"
		);
		fireEvent.click(getByLabelText("listen-send"));

		expect(sendMessageMock).toHaveBeenCalledWith(
			expect.objectContaining({
				chatId,
				message: `${transcript}\n\`\`\`typescript\nconsole.log('Hello World!');\n\`\`\`\n`,
			})
		);
	});

	const setupMocks = () => {
		setupSpeechRecognitionHook(transcript, true);
		useSendMessageMutation.mockImplementation(() => [
			sendMessageMock,
			{ isLoading: false },
		]);
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

	const renderChat = () => {
		return renderWithProviders(<Chat />, {
			preloadedState: {
				chat: {
					id: chatId,
					transcript: "",
					attachments: [],
					composedMessage: "",
					messages: [],
				},
			},
		});
	};

	const renderChatAndAddAttachment = (codeToAttach: string) => {
		const renderResult = renderChat();
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
