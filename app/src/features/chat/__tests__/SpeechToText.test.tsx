import "regenerator-runtime/runtime";
import { renderWithProviders } from "../../../utils/test-utils";
import { fireEvent } from "@testing-library/react";
import SpeechToText from "../SpeechToText";
import SpeechRecognition, { useSpeechRecognition} from "react-speech-recognition";

jest.mock("react-speech-recognition", () => ({
	__esModule: true,
	useSpeechRecognition: jest.fn(),
	default: {
		startListening: jest.fn(),
		stopListening: jest.fn(),
	},
}));

describe("SpeechToText", () => {

	const transcriptText = "this is a test";
 
	it("should render the component without errors", () => {

		useSpeechRecognition.mockReturnValue({
			transcript: transcriptText,
			listening: false,
			browserSupportsSpeechRecognition: true,
		});

		const { getByAltText } = renderWithProviders(<SpeechToText />);

		const micImage = getByAltText("Start Listening");
		expect(micImage).toBeInTheDocument();
	});

	it("should start listening when the mic button is clicked", () => {

		useSpeechRecognition.mockReturnValue({
			resetTranscript: jest.fn(),
			listening: false,
			browserSupportsSpeechRecognition: true,
		});

		const { getByRole } = renderWithProviders(<SpeechToText />);

		const micButton = getByRole("button");
		fireEvent.click(micButton);

		expect(SpeechRecognition.startListening).toHaveBeenCalledWith({
			continuous: true,
		});
	});

	it("should stop listening when the mic button is clicked", () => {

		useSpeechRecognition.mockReturnValue({
			transcript: transcriptText,
			listening: true,
			browserSupportsSpeechRecognition: true,
		});

		const { getByRole } = renderWithProviders(<SpeechToText />);
		
		const micButton = getByRole("button");
		fireEvent.click(micButton);

		expect(SpeechRecognition.stopListening).toHaveBeenCalledTimes(1);
	});

	it("should display the transcript", () => {

		useSpeechRecognition.mockReturnValue({
			transcript: transcriptText,
			listening: true,
			browserSupportsSpeechRecognition: true,
		});

		const { getByText } = renderWithProviders(<SpeechToText />);
		const transcript = getByText(transcriptText);
		expect(transcript).toBeInTheDocument();
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
