import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSendMessageMutation, useTextToSpeechMutation } from "../services/chatApi";
import { mapToContentParts } from "../features/chat/mappers/contentMapper";
import { RootStateType } from "../store";

import ChatLog from "../features/chat/components/ChatLog";
import SpeechToText from "../features/chat/components/SpeechToText";

const Chat = () => {

	const chatId = useSelector(
		(state: RootStateType) => state.chat.id
	);

	const [sendMessage, { data: sendMessageResult, isLoading: isLoadingText }] = useSendMessageMutation();
	const [textToSpeech, { data: textToSpeechResult, isLoading: isLoadingAudio }] = useTextToSpeechMutation();

	useEffect(() => {
		const message = sendMessageResult?.message;
		if (message) {
			const transcript = mapToSpokenTranscript(message);
			textToSpeech({ transcript });
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
			<div className="flex flex-col items-center mt-16 pt-4 px-8 sm:ml-64 sm:mt-2 overflow-y-auto h-[calc(100vh-10px)]">
				<div className="flex flex-col items-center text-base w-full pt-4 sm:w-[75%]">
					<div className="flex w-full mb-[100px]">
						<ChatLog />
					</div>
				</div>
			</div>

			<div className="fixed sm:left-[128px] bottom-0 w-full overflow-y-hidden">
				<div className="flex flex-col left-0 items-center mb-4">
					{isLoadingText || isLoadingAudio ? (
						<div className="relative bg-[#1e1e26] rounded-full">
							<div className="loader"></div>
						</div>
					) : (
						<SpeechToText onResult ={onSpeechRecognitionResult} />
					)}
				</div>
			</div>
		</>
	);
};

export default Chat;

function mapToSpokenTranscript(message: string) {
	const contentParts = mapToContentParts(message);
	return contentParts.reduce((transcript: string, part: MessagePart) => {
		switch (part.type) {
			case "OrderedList":
				return `${transcript}${(part as OrderedList).numberedPoints.join("\n")}`;
			case "Paragraph":
				return `${transcript}${(part as Paragraph).text}\n`;
			default:
				return transcript;
		}
	}, "");
}
