import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addOrUpdateMessage } from "../chatSlice";
import useAudioPlayer from "../hooks/useAudioPlayer";
import useAuth from "../../auth/hooks/useAuth";
import AddAttachment from "./AddAttachment";
import ChatLog from "./ChatLog";
import ChatService from "../services/ChatService";
import HeroSection from "../../../components/HeroSection";
import SpeechToText from "./SpeechToText";
import TypingIndicator from "../../../components/TypingIndicator";
import { RootStateType } from "../../../store";

const Chat = () => {
	const dispatch = useDispatch();
	const { userId } = useAuth();
	const { queueAudio } = useAudioPlayer();
	const { chatId, attachments, messages } = useSelector(
		(state: RootStateType) => state.chat
	);
	const [isAwaitingAudio, setIsAwaitingAudio] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	useEffect(() => {
		chatService.current?.connect();
		return () => {
			chatService.current?.disconnect();
		};
	}, [userId]);

	useEffect(() => {
		scrollTo(scrollToTargetRef.current);
	}, [messages]);

	const onTranscriptionEnded = (transcript: string) => {
		const message = composeMessage(transcript, attachments);
		setIsAwaitingAudio(true);
		dispatch(addOrUpdateMessage({ message }));

		chatService.current?.send({
			type: "userMessage" as const,
			payload: {
				userId,
				chatId,
				message,
			} as MessagePayload,
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

		const text =
			codeAttachments.length > 0
				? `${transcript}\n${flatMap(codeAttachments).join("\n")}`
				: transcript;

		return {
			id: uuidv4(),
			role: "user",
			content: {
				type: "text",
				value: text,
			},
			timestamp: Date.now(),
		};
	};

	const onMessageReceived = ({ type, payload }: WebSocketMessage) => {
		switch (type) {
			case "assistantMessageSegment":
				processMessageSegmentPayload(payload as MessageSegmentPayload);
				break;

			case "assistantAudioSegment":
				processAudioSegmentPayload(payload as AudioSegmentPayload);
				break;
		}
	};

	const processMessageSegmentPayload = (payload: MessageSegmentPayload) => {
		const { message, isLastSegment } = payload;

		setIsTyping(false);
		if (typingIndicatorTimerRef.current) {
			clearTimeout(typingIndicatorTimerRef.current);
		}

		if (!isLastSegment) {
			typingIndicatorTimerRef.current = setTimeout(() => {
				setIsTyping(true);
			}, 1500);
		}
		dispatch(
			addOrUpdateMessage({
				message,
			})
		);
	};

	const processAudioSegmentPayload = (payload: AudioSegmentPayload) => {
		setIsAwaitingAudio(false);
		queueAudio(payload.audioSegment);
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
	const typingIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const scrollToTargetRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{messages.length === 0 && attachments.length === 0 && <HeroSection />}

			<div className="flex flex-col w-full mb-[100px]">
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
							<AddAttachment />
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Chat;
