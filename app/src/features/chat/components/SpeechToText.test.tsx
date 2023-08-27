import { Mock, vi } from "vitest";
import SpeechRecognition, {	useSpeechRecognition } from "react-speech-recognition";
import { render, fireEvent } from "@testing-library/react";

import SpeechToText from "./SpeechToText";

vi.mock("react-speech-recognition", () => ({
	__esModule: true,
	useSpeechRecognition: vi.fn(),
	default: {
		startListening: vi.fn(),
		stopListening: vi.fn(),
	},
}));

const useSpeechRecognitionMock = useSpeechRecognition as Mock;

describe("SpeechToText", () => {
	const mockTranscript = "this is a test";

	const setupSpeechRecognitionHook = (
		transcript: string,
		listening: boolean
	) => {
		useSpeechRecognitionMock.mockReturnValue({
			transcript,
			interimTranscript: transcript,
			finalTranscript: transcript,
			listening,
			browserSupportsSpeechRecognition: true,
			resetTranscript: vi.fn(),
			isMicrophoneAvailable: true,
		});
	};

	it("should render the component without errors", () => {
		setupSpeechRecognitionHook("", false);

		const { getByRole } = renderSpeechToText();

		const micButton = getByRole("button");
		expect(micButton).toBeInTheDocument();
	});

	it("should start listening when the mic button is clicked", () => {
		setupSpeechRecognitionHook("", false);

		const { getByRole } = renderSpeechToText();
		const micButton = getByRole("button");
		fireEvent.click(micButton);

		expect(SpeechRecognition.startListening).toHaveBeenCalledWith({
			continuous: true,
		});
	});

	it("should display the transcript", () => {
		setupSpeechRecognitionHook(mockTranscript, true);

		const { getByText } = renderSpeechToText();

		const transcript = getByText(mockTranscript);
		expect(transcript).toBeInTheDocument();
	});

	it("should stop listening and pass the transcript to the onTranscriptionEnded callback prop", () => {
		setupSpeechRecognitionHook(mockTranscript, true);

		const { getByRole, onTranscriptionEndedMock } = renderSpeechToText();
		const micButton = getByRole("button");
		fireEvent.click(micButton);

		expect(SpeechRecognition.stopListening).toHaveBeenCalledTimes(1);
		expect(onTranscriptionEndedMock).toHaveBeenCalledWith(mockTranscript);
	});

	it("should display a message when the browser doesn't support speech recognition", () => {
		useSpeechRecognitionMock.mockReturnValue({
			browserSupportsSpeechRecognition: false,
		});

		const { getByText } = renderSpeechToText();

		const errorMessage = getByText(
			"Browser doesn't support speech recognition."
		);
		expect(errorMessage).toBeInTheDocument();
	});

	it.each([
		"Hello Cynth",
		"Hey Cynth",
		"Hi Cynth",
		"Hiya Cynth",
		"Hello Cynthia",
		"Hey Cynthia",
		"Hi Cynthia",
		"Hiya Cynthia",
		"Hello Seth",
		"Hey Seth",
		"Hi Seth",
		"Hiya Seth",
	])(
		"should fix common misheard name in a greeting: %s",
		(misheardGreeting: string) => {
			setupSpeechRecognitionHook(`${misheardGreeting}, how's it going?`, true);

			const { getByText } = renderSpeechToText();

			const greetingWord = misheardGreeting.split(" ")[0];
			const errorMessage = getByText(`${greetingWord} Synth, how's it going?`);
			expect(errorMessage).toBeInTheDocument();
		}
	);

	const renderSpeechToText = () => {
		const onTranscriptionEndedMock = vi.fn();
		const renderResult = render(
			<SpeechToText onTranscriptionEnded={onTranscriptionEndedMock} />
		);
		return { ...renderResult, onTranscriptionEndedMock };
	};
});
