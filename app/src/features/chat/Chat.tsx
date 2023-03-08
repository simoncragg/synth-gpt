import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSendMessageMutation, useTextToSpeechMutation } from "../../services/chatApi";
import { RootStateType } from "../../store";
import SpeechToText from "./SpeechToText";
import ChatLog from "./ChatLog";
import "./Chat.css";

const Chat = () => {

	const chatId = useSelector(
		(state: RootStateType) => state.chat.id
	);

	const [sendMessage, { data: sendMessageResult, isLoading: isLoadingText }] = useSendMessageMutation();
	const [textToSpeech, { data: textToSpeechResult, isLoading: isLoadingAudio }] = useTextToSpeechMutation();

	useEffect(() => {
		const message = sendMessageResult?.message;
		if (message) {
			textToSpeech({ transcript: message });
		}
	}, [sendMessageResult]);

	useEffect(() => {
		const audioUrl = textToSpeechResult?.audioUrl;
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audio.addEventListener("canplay", () => {
				audio.play();
			});
			audio.addEventListener("error", () => {
				console.log(`Error loading ${audioUrl}`);
			});
		}
	}, [textToSpeechResult]);

	const onSpeechRecognitionResult = (transcript: string) => {
		sendMessage({ chatId, message: transcript });
	};

	return (
		<div className="chat-container">
			<SpeechToText onResult ={onSpeechRecognitionResult} isLoading={isLoadingText || isLoadingAudio} />
			<ChatLog />

		</div>
	);
};

export default Chat;

