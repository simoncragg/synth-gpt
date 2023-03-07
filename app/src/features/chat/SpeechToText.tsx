import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./SpeechToText.css";

type SpeechToTextProps = {
	onResult: (transition: string) => void;
	isLoading: boolean;
};

const SpeechToText = ({ onResult, isLoading }: SpeechToTextProps) => {

	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition
	} = useSpeechRecognition();

	if (!browserSupportsSpeechRecognition) {
		return <span>Browser doesn't support speech recognition.</span>;
	}

	const toggleListen = () => {
		if (!listening) {
			resetTranscript();
			SpeechRecognition.startListening({ continuous: true });
		} else {
			SpeechRecognition.stopListening();
			if (transcript) {
				onResult (transcript);
			}
		}
	};

	return (
		<>
			<div className="mic-container">
				{ isLoading ? (
					<div className="loader"></div>
				) : (
					<>
						<button data-testid="mic-button" role="button" onClick={toggleListen}>
							<img src="/mic.svg" alt="Start Listening" />
						</button>
						{ listening && <div className="mic-pulse" /> }
					</>
				)}

			</div>

			<div className="transcript-container">
				<p>{transcript}</p>
			</div>
		</>
	);
};

export default SpeechToText;