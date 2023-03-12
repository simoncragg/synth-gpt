import { v4 as uuidv4 } from "uuid";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import { useSendMessageMutation, useTextToSpeechMutation } from "../services/chatApi";
import { useSpeechRecognition } from "react-speech-recognition";
import Chat from "./Chat";

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

describe("Chat", () => {

	it("should call useSendMessageMutation with correct arguments when onTransitionEnd is called", () => {

		const chatId = uuidv4();

		console.log(`chatId: ${chatId}`);

		const transcript = "this is a test";

		useSpeechRecognition.mockReturnValue({
			transcript: transcript,
			listening: true,
			browserSupportsSpeechRecognition: true,
			resetTranscript: jest.fn()
		});

		const sendMessageMock = jest.fn();
		useSendMessageMutation.mockImplementation(() => [sendMessageMock, { isLoading: false }]);

		const textToSpeechMock = jest.fn();
		useTextToSpeechMutation.mockImplementation(() => [textToSpeechMock, { isLoading: false }]);

		const { getByTestId } = renderWithProviders(<Chat />, {
			preloadedState: {
				chat: {
					id: chatId,
					messages: []
				}
			}
		});

		fireEvent.click(getByTestId("mic-button"));

		expect(sendMessageMock).toHaveBeenCalledWith({
			chatId: chatId,
			message: transcript,
		});
	});
});
