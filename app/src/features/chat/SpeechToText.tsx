import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { BsStopFill } from "react-icons/bs";
import "./SpeechToText.css";

type SpeechToTextProps = {
	onResult: (transition: string) => void;
};

const SpeechToText = ({ onResult }: SpeechToTextProps) => {

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
			{ listening && transcript === "" && (
				<div className="pb-8 text-2xl">I'm listening ...</div>
			)}

			{ transcript && (
				<div className="pb-8 text-3xl">{transcript}</div>	
			)}

			<button 
				role="button" 
				data-testid="mic-button" 
				className="bg-slate-900 py-4 px-4 border-2 border-slate-500 rounded-full" 
				onClick={toggleListen}
			>
				{ listening ? (
					<BsStopFill className="w-8 h-8 text-blue-300" />
				) : (
					<img src="/mic.svg" alt="Start Listening" className="w-10 h-10" />
				)}
			</button>
			{ listening && <div className="mic-pulse"></div> }
		</>
	);
};

export default SpeechToText;