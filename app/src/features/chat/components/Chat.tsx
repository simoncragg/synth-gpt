import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
	useSendMessageMutation,
	useTextToSpeechMutation,
} from "../../../services/chatApi";
import { mapToSpokenTranscript } from "../mappers/contentMapper";
import { RootStateType } from "../../../store";
import HeroSection from "../../../components/HeroSection";
import ChatLog from "./ChatLog";
import SpeechToText from "./SpeechToText";
import AddAttachment from "./AddAttachment";

const Chat = () => {
	const { chatId, attachments, messages } = useSelector(
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
		scrollTo(scrollToTargetRef.current);
	}, [messages]);

	useEffect(() => {
		const message = sendMessageResult?.message;
		if (message) {
			const transcript = mapToSpokenTranscript(message.content);
			textToSpeech({ transcript });
		}
	}, [sendMessageResult]);

	useEffect(() => {
		playAudio(textToSpeechResult?.audioUrl);
	}, [textToSpeechResult]);

	const onTranscriptionEnded = (transcript: string) => {
		const message = composeMessage(transcript, attachments);
		sendMessage({
			chatId,
			message,
		});
	};

	const composeMessage = (
		transcript: string,
		attachments: Attachment[]
	): ChatMessage => {
		const codeAttachments = attachments.filter(
			(x) => x.type === "Code"
		) as CodeAttachment[];

		const flatMap = (codeAttachments: CodeAttachment[]) => {
			return codeAttachments.flatMap(
				(attachment) =>
					`\`\`\`${attachment.content.language}\n${attachment.content.code}\n\`\`\`\n`
			);
		};

		const content =
			codeAttachments.length > 0
				? `${transcript}\n${flatMap(codeAttachments).join("\n")}`
				: transcript;

		return {
			id: uuidv4(),
			role: "user",
			content,
			timestamp: Date.now(),
		};
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

	const scrollTo = (target: HTMLDivElement | null) => {
		target?.scrollIntoView({
			behavior: "smooth",
			block: "end",
			inline: "nearest",
		});
	};

	return (
		<>
			{isLoadingText ||
				(messages.length === 0 && attachments.length === 0 && <HeroSection />)}

			<div className="flex w-full mb-[100px]">
				<ChatLog />
			</div>

			<div ref={scrollToTargetRef} data-testid="scroll-target"></div>

			<div className="fixed sm:left-[256px] bottom-0 w-full sm:w-[calc(100vw-256px)] overflow-y-hidden">
				<div className="flex flex-col left-0 items-center mb-4">
					{isLoadingText || isLoadingAudio ? (
						<div className="relative bg-slate-900 rounded-full p-2">
							<div className="loader w-[70px] h-[70px] rounded-full z-50"></div>
						</div>
					) : (
						<>
							<SpeechToText onTranscriptionEnded={onTranscriptionEnded} />
							<AddAttachment />
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Chat;
