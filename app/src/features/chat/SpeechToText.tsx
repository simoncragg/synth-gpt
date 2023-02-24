import { useDispatch } from "react-redux";
import { sendMessage } from "./chatSlice";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./SpeechToText.css";

const SpeechToText = () => {

	const dispatch = useDispatch();

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
				dispatch(sendMessage(transcript));
			}
		}
	};

	return (
		<>
			<div className="mic-container">
				<button role="button"
					onClick={toggleListen}
				>
					<img src="/mic.svg" alt="Start Listening" />
				</button>
				{ listening && <div className="mic-pulse" />}
			</div>

			<div className="transcript-container">
				<p>{transcript}</p>
			</div>
		</>
	);
};

export default SpeechToText;