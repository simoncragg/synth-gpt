import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSendMessageMutation, useTextToSpeechMutation } from "../services/chatApi";
import { mapToSpokenTranscript } from "../features/chat/mappers/contentMapper";
import { RootStateType } from "../store";
import HeroSection from "../components/HeroSection";
import ChatLog from "../features/chat/components/ChatLog";
import SpeechToText from "../features/chat/components/SpeechToText";

const Chat = () => {

	const { id: chatId, messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const [sendMessage, { data: sendMessageResult, isLoading: isLoadingText }] = useSendMessageMutation();
	const [textToSpeech, { data: textToSpeechResult, isLoading: isLoadingAudio }] = useTextToSpeechMutation();

	const scrollToTargetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const message = sendMessageResult?.message;
		if (message) {
			const transcript = mapToSpokenTranscript(message);
			textToSpeech({ transcript });
		}
	}, [sendMessageResult]);

	useEffect(() => {
		scrollTo(scrollToTargetRef.current);
		playAudio(textToSpeechResult?.audioUrl);
	}, [textToSpeechResult]);

	const onSpeechRecognitionResult = (transcript: string) => {
		sendMessage({ chatId, message: transcript });
	};

	const scrollTo = (target: HTMLDivElement | null) => {
		target?.scrollIntoView({
			behavior: "smooth", 
			block: "end", 
			inline: "nearest"
		});
	};

	const playAudio = (audioUrl: string | undefined) => {
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audio.addEventListener("canplay", () => {
				audio.play();
			});
			audio.addEventListener("error", () => {
				console.log(`Error loading ${audioUrl}`);
			});
		}
	};

	return (
		<>
			<div className="flex flex-col items-center mt-16 pt-4 px-8 sm:ml-64 sm:mt-2 overflow-y-auto h-[calc(100vh-10px)]">
				<div className="flex flex-col items-center text-base w-full pt-4 sm:w-[75%]">

					{ isLoadingText || messages.length === 0 && (
						<HeroSection />
					)}

					<div className="flex w-full mb-[100px]">
						<ChatLog />
					</div>

					<div ref={scrollToTargetRef} data-testid="scroll-target"></div>

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
