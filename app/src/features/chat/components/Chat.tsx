import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addMessage } from "../chatSlice";
import { mapToSpokenTranscript } from "../mappers/contentMapper";
import { useTextToSpeechMutation } from "../../../services/chatApi";
import AddAttachment from "./AddAttachment";
import ChatLog from "./ChatLog";
import ChatService from "../services/ChatService";
import HeroSection from "../../../components/HeroSection";
import SpeechToText from "./SpeechToText";
import { RootStateType } from "../../../store";

const Chat = () => {
	const dispatch = useDispatch();
	const [isAwaitingServerMessage, setIsAwaitingServerMessage] = useState(false);

	const { chatId, attachments, messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const [
		textToSpeech,
		{ data: textToSpeechResult, isLoading: isLoadingAudio },
	] = useTextToSpeechMutation();

	useEffect(() => {
		chatService.current?.connect();
		return () => {
			chatService.current?.disconnect();
		};
	}, []);

	useEffect(() => {
		scrollTo(scrollToTargetRef.current);
	}, [messages]);

	useEffect(() => {
		playAudio(textToSpeechResult?.audioUrl);
	}, [textToSpeechResult]);

	const onTranscriptionEnded = (transcript: string) => {
		const message = composeMessage(transcript, attachments);
		setIsAwaitingServerMessage(true);
		dispatch(addMessage({ message }));

		chatService.current?.send({
			type: "userMessage" as const,
			payload: {
				chatId,
				message,
			} as MessagePayload,
		});
	};

	const onMessageReceived = ({ type, payload }: WebSocketMessage) => {
		setIsAwaitingServerMessage(false);
		if (type === "assistantMessage") {
			const messagePayload = payload as MessagePayload;
			dispatch(
				addMessage({
					message: messagePayload.message,
				})
			);
			const transcript = mapToSpokenTranscript(messagePayload.message.content);
			textToSpeech({ transcript });
		}
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

	const chatService = useRef<ChatService>(
		new ChatService(chatId, onMessageReceived)
	);
	const scrollToTargetRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{messages.length === 0 && attachments.length === 0 && <HeroSection />}

			<div className="flex w-full mb-[100px]">
				<ChatLog />
			</div>

			<div ref={scrollToTargetRef} data-testid="scroll-target"></div>

			<div className="fixed sm:left-[256px] bottom-0 w-full sm:w-[calc(100vw-256px)] overflow-y-hidden">
				<div className="flex flex-col left-0 items-center mb-4">
					{isAwaitingServerMessage || isLoadingAudio ? (
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
