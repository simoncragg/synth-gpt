import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
	useSendMessageMutation,
	useTextToSpeechMutation,
} from "../services/chatApi";
import { mapToSpokenTranscript } from "../features/chat/mappers/contentMapper";
import { RootStateType } from "../store";
import HeroSection from "../components/HeroSection";
import ChatLog from "../features/chat/components/ChatLog";
import SpeechToText from "../features/chat/components/SpeechToText";
import AddAttachment from "../features/chat/components/AddAttachment";

const Chat = () => {
	const { chatId, composedMessage, attachments, messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const [sendMessage, { data: sendMessageResult, isLoading: isLoadingText }] =
		useSendMessageMutation();

	const [
		textToSpeech,
		{ data: textToSpeechResult, isLoading: isLoadingAudio },
	] = useTextToSpeechMutation();

	const scrollToTargetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (composedMessage) {
			sendMessage({ chatId, message: composedMessage });
		}
	}, [composedMessage]);

	useEffect(() => {
		scrollTo(scrollToTargetRef.current);
	}, [messages]);

	useEffect(() => {
		if (sendMessageResult?.message?.content) {
			const { content } = sendMessageResult.message;
			const transcript = mapToSpokenTranscript(content);
			textToSpeech({ transcript });
		}
	}, [sendMessageResult]);

	useEffect(() => {
		playAudio(textToSpeechResult?.audioUrl);
	}, [textToSpeechResult]);

	const scrollTo = (target: HTMLDivElement | null) => {
		target?.scrollIntoView({
			behavior: "smooth",
			block: "end",
			inline: "nearest",
		});
	};

	const playAudio = (audioUrl: string | undefined) => {
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audio.addEventListener("canplay", () => {
				audio.play();
			});
			audio.addEventListener("error", () => {
				console.error(`Error loading ${audioUrl}`);
			});
		}
	};

	return (
		<>
			<div className="flex flex-col items-center mt-16 pt-4 px-8 sm:ml-64 sm:mt-2 overflow-y-auto h-[calc(100vh-10px)]">
				<div className="flex flex-col items-center text-base w-full pt-4 sm:w-3/4">
					{isLoadingText ||
						(messages.length === 0 && attachments.length === 0 && (
							<HeroSection />
						))}

					<div className="flex w-full mb-[100px]">
						<ChatLog />
					</div>

					<div ref={scrollToTargetRef} data-testid="scroll-target"></div>
				</div>
			</div>

			<div className="fixed sm:left-[256px] bottom-0 w-full sm:w-[calc(100vw-256px)] overflow-y-hidden">
				<div className="flex flex-col left-0 items-center mb-4">
					{isLoadingText || isLoadingAudio ? (
						<div className="relative bg-slate-900 rounded-full p-2">
							<div className="loader w-[70px] h-[70px] rounded-full z-50"></div>
						</div>
					) : (
						<>
							<SpeechToText />
							<AddAttachment />
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Chat;
