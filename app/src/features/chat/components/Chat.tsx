import Attach from "./Attach";
import ChatLog from "./ChatLog";
import ChatModelSelector from "./ChatModelSelector";
import HeroSection from "../../../components/HeroSection";
import SpeechToText from "./SpeechToText";
import TypingIndicator from "../../../components/TypingIndicator";
import useChat from "../hooks/useChat";
import useScroll from  "../hooks/useScroll";

const Chat = () => {

	const { 
		messages, 
		attachments, 
		isTyping, 
		isAwaitingAudio, 
		onTranscriptionEnded
	} = useChat();

	const { scrollToTargetRef } = useScroll();

	return (
		<>
			{messages.length === 0 && attachments.length === 0 && <HeroSection />}

			<div className="flex flex-col w-full mb-[100px]">
				<ChatModelSelector />
				<ChatLog />
				{isTyping && <TypingIndicator className="flex ml-6 -mt-8" />}
			</div>

			<div ref={scrollToTargetRef} data-testid="scroll-target"></div>

			<div className="fixed sm:left-[256px] bottom-0 w-full sm:w-[calc(100vw-256px)] overflow-y-hidden">
				<div className="flex flex-col left-0 items-center mb-4">
					{isAwaitingAudio ? (
						<div className="relative bg-slate-900 rounded-full p-2">
							<div className="loader w-[70px] h-[70px] rounded-full z-50"></div>
						</div>
					) : (
						<>
							<SpeechToText onTranscriptionEnded={onTranscriptionEnded} />
							<Attach />
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Chat;
