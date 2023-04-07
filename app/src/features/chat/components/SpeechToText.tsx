import { useState, useEffect } from "react";
import { BsSend } from "react-icons/bs";
import SpeechRecognition, {
	useSpeechRecognition,
} from "react-speech-recognition";
import "./SpeechToText.css";

interface SpeechToTextProps {
	onTranscriptionEnded: (transcript: string) => void;
}

const SpeechToText = ({ onTranscriptionEnded }: SpeechToTextProps) => {
	const [fixedTranscript, setFixedTranscript] = useState("");

	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
	} = useSpeechRecognition();

	useEffect(() => {
		if (transcript) {
			setFixedTranscript(fixTranscript(transcript));
		}
	}, [transcript]);

	const toggleListen = () => {
		if (!listening) {
			resetTranscript();
			SpeechRecognition.startListening({ continuous: true });
		} else {
			SpeechRecognition.stopListening();
			if (transcript) {
				onTranscriptionEnded(fixedTranscript);
			}
		}
	};

	const fixTranscript = (transcript: string) => {
		return transcript.replace(
			/^(Hello|Hey|Hiya|Hi)(?:,|,\s|\s)(?:Cynthia|Cynth|Seth)/,
			(match, capturedGroup) => `${capturedGroup} Synth`
		);
	};

	if (!browserSupportsSpeechRecognition) {
		return <span>Browser doesn't support speech recognition.</span>;
	}

	return (
		<>
			{listening && transcript === "" && (
				<div className="pb-8 text-2xl">I'm listening ...</div>
			)}

			{fixedTranscript && (
				<div className="flex pb-8 justify-center text-2xl w-4/5 sm:w-3/4">
					{fixedTranscript}
				</div>
			)}

			<button
				role="button"
				aria-label="listen-send"
				className="bg-slate-900 py-4 px-4 bottom-2 border-2 border-slate-500 rounded-full"
				onClick={toggleListen}
			>
				{listening ? (
					<BsSend
						className="w-8 h-8 text-blue-300"
						style={{ marginRight: "1.5px" }}
					/>
				) : (
					<img src="/mic.svg" alt="Start Listening" className="w-10 h-10" />
				)}
			</button>
			{listening && (
				<div className="fixed mic-pulse w-[100px] h-[100px] bottom-0 rounded-full z-[-1]"></div>
			)}
		</>
	);
};

export default SpeechToText;
