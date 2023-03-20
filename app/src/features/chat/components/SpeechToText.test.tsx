import "regenerator-runtime/runtime";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { v4 as uuidv4 } from "uuid";
import SpeechRecognition, { useSpeechRecognition} from "react-speech-recognition";
import SpeechToText from "./SpeechToText";

jest.mock("react-speech-recognition", () => ({
	__esModule: true,
	useSpeechRecognition: jest.fn(),
	default: {
		startListening: jest.fn(),
		stopListening: jest.fn(),
	},
}));

describe("SpeechToText", () => {

	const mockTranscript = "this is a test";
 
	const setupSpeechRecognitionHook = (transcript: string, listening: boolean) => {
		useSpeechRecognition.mockReturnValue({
			resetTranscript: jest.fn(),
			transcript,
			listening,
			browserSupportsSpeechRecognition: true,
		});
	};

	it("should render the component without errors", () => {

		setupSpeechRecognitionHook("", false);

		const { getByRole} = renderWithProviders(<SpeechToText />);
		const micButton = getByRole("button");

		expect(micButton).toBeInTheDocument();
	});

	it("should start listening when the mic button is clicked", () => {

		setupSpeechRecognitionHook("", false);

		const { getByRole } = renderWithProviders(<SpeechToText />);
		const micButton = getByRole("button");
		fireEvent.click(micButton);

		expect(SpeechRecognition.startListening).toHaveBeenCalledWith({
			continuous: true,
		});
	});

	it("should display the transcript", () => {

		setupSpeechRecognitionHook(mockTranscript, true);

		const { getByText } = renderWithProviders(<SpeechToText />, {
			preloadedState: {
				chat: {
					id: uuidv4(),
					transcript: "",
					messages: []
				}
			}
		});

		const transcript = getByText(mockTranscript);
		expect(transcript).toBeInTheDocument();
	});

	it.only("should stop listening and update the store's transcript when the mic button is clicked", () => {

		setupSpeechRecognitionHook(mockTranscript, true);

		const { getByRole, store } = renderWithProviders(<SpeechToText />);
		const micButton = getByRole("button");

		const preState = store.getState();
		expect(preState.chat.transcript).toEqual("");

		fireEvent.click(micButton);

		const postState = store.getState();
		expect(postState.chat.transcript).toEqual(mockTranscript);
		expect(SpeechRecognition.stopListening).toHaveBeenCalledTimes(1);
	});

	it("should display a message when the browser doesn't support speech recognition", () => {

		useSpeechRecognition.mockReturnValue({
			browserSupportsSpeechRecognition: false,
		});

		const { getByText } = renderWithProviders(<SpeechToText />);
		const errorMessage = getByText("Browser doesn't support speech recognition.");
		expect(errorMessage).toBeInTheDocument();
	});
});
