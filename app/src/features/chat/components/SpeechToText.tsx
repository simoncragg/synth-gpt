import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTranscript } from "../chatSlice";
import { BsStopFill } from "react-icons/bs";
import SpeechRecognition, {
	useSpeechRecognition,
} from "react-speech-recognition";
import "./SpeechToText.css";

const SpeechToText = () => {
	const [fixedTranscript, setFixedTranscript] = useState("");
	const dispatch = useDispatch();

	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
	} = useSpeechRecognition();

	if (!browserSupportsSpeechRecognition) {
		return <span>Browser doesn't support speech recognition.</span>;
	}

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
				dispatch(updateTranscript({ transcript: fixedTranscript }));
				resetTranscript();
			}
		}
	};

	const fixTranscript = (transcript: string) => {
		return transcript.replace(
			/^(Hello|Hey|Hiya|Hi)(?:,|,\s|\s)(?:Cynthia|Cynth|Seth)/,
			(match, capturedGroup) => `${capturedGroup} Synth`
		);
	};

	return (
		<>
			{listening && transcript === "" && (
				<div className="pb-8 text-2xl">I'm listening ...</div>
			)}

			{fixedTranscript && (
				<div className="pb-8 text-3xl">{fixedTranscript}</div>
			)}

			<button
				role="button"
				data-testid="mic-button"
				className="bg-slate-900 py-4 px-4 border-2 border-slate-500 rounded-full"
				onClick={toggleListen}
			>
				{listening ? (
					<BsStopFill className="w-8 h-8 text-blue-300" />
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
