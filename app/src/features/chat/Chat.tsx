import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSendMessageMutation, useTextToSpeechMutation } from "../../services/chatApi";
import { RootStateType } from "../../store";
import SpeechToText from "./SpeechToText";

import ChatLog from "./ChatLog";

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
		<>
			<div className="fixed left-0 bottom-4 z-50 w-full">
				<div className="flex flex-col left-0 items-center">
					{ isLoadingText || isLoadingAudio ? (
						<div className="relative bg-[#1e1e26] rounded-full">
							<div className="loader"></div>
						</div>
					) : (
						<SpeechToText onResult ={onSpeechRecognitionResult} />
					)}
				
				</div>
			</div>

			<ChatLog />
		</>
	);
};

export default Chat;

