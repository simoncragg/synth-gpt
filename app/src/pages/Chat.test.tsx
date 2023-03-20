import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import { useSendMessageMutation, useTextToSpeechMutation } from "../services/chatApi";
import { useSpeechRecognition } from "react-speech-recognition";
import { v4 as uuidv4 } from "uuid";
import Chat from "./Chat";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("../services/chatApi", () => ({
	useSendMessageMutation: jest.fn(),
	useTextToSpeechMutation: jest.fn(),
	chatApi: {
		reducer: {},
		middleware: []
	}
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

	const setupSpeechRecognitionHook = (transcript: string, listening: boolean) => {
		useSpeechRecognition.mockReturnValue({
			transcript,
			listening,
			browserSupportsSpeechRecognition: true,
			resetTranscript: jest.fn()
		});
	};

	it("should call useSendMessageMutation with correct args when transcript changes", () => {

		setupSpeechRecognitionHook(transcript, true);

		const sendMessageMock = jest.fn();
		useSendMessageMutation.mockImplementation(() => [sendMessageMock, { isLoading: false }]);

		const textToSpeechMock = jest.fn();
		useTextToSpeechMutation.mockImplementation(() => [textToSpeechMock, { isLoading: false }]);

		const { getByTestId } = renderChat();
		fireEvent.click(getByTestId("mic-button"));

		expect(sendMessageMock).toHaveBeenCalledWith({
			chatId: chatId,
			message: transcript,
		});
	});

	it("should scroll to bottom of window", () => {

		setupSpeechRecognitionHook(transcript, true);

		useSendMessageMutation.mockImplementation(() => [jest.fn(), { isLoading: false }]);
		useTextToSpeechMutation.mockImplementation(() => [jest.fn(), { isLoading: false }]);

		const { getByTestId } = renderChat();
		fireEvent.click(getByTestId("mic-button"));

		const scrollTarget = getByTestId("scroll-target");
		expect(scrollTarget.scrollIntoView).toHaveBeenCalledWith(
			expect.objectContaining({
				behavior: "smooth"
			}));
	});

	const renderChat = () => {
		return renderWithProviders(<Chat />, {
			preloadedState: {
				chat: {
					id: chatId,
					messages: []
				}
			}
		});
	};
});
