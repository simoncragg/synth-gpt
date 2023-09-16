import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import useAudioPlayer from "../hooks/useAudioPlayer";
import useAuth from "../../auth/hooks/useAuth";
import useWebSocket from "../hooks/useWebSocket";
import { RootStateType } from "../../../store";
import { addOrUpdateMessage } from "../chatSlice";
import { useCreateWsTokenMutation } from "../../auth/authApi";

const useChat = () => {
	const dispatch = useDispatch();
	const { userId, accessToken } = useAuth();
	const { queueAudio } = useAudioPlayer();

	const { chatId, attachments, messages, model } = useSelector(
		(state: RootStateType) => state.chat
	);
	const [isAwaitingAudio, setIsAwaitingAudio] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const [createWsToken, { data: createWsTokenResponse }] =
		useCreateWsTokenMutation();

	useEffect(() => {
		if (userId && accessToken) {
			createWsToken({ userId, accessToken });
		}
	}, [userId, accessToken]);

	useEffect(() => {
		const tokenId = createWsTokenResponse?.tokenId;
		if (tokenId) {
			connect(tokenId);
		}
		return () => {
			disconnect();
		};
	}, [createWsTokenResponse]);

	const onTranscriptionEnded = (transcript: string) => {
		const message = buildMessage(transcript, attachments);
		setIsAwaitingAudio(true);
		dispatch(addOrUpdateMessage({ message, isLastSegment: true }));
		send({
			type: "userMessage" as const,
			payload: {
				userId,
				chatId,
				message,
				model
			} as MessagePayload,
		});
	};

    const buildMessage = (transcript: string, attachments: Attachment[]): ChatMessage => {
		return {
			id: uuidv4(),
			role: "user",
			attachments,
			content: {
				type: "text",
				value: transcript,
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

	const onConnectionClosed = (event: CloseEvent) => {
		const normalClosureCode = 1000;
		if (event.code !== normalClosureCode) {
			if (userId && accessToken) {
				createWsToken({ userId, accessToken });
			}
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
				isLastSegment,
			})
		);
	};

	const processAudioSegmentPayload = (payload: AudioSegmentPayload) => {
		setIsAwaitingAudio(false);
		queueAudio(payload.audioSegment);
	};

	const typingIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	const { connect, send, disconnect } = useWebSocket({
		onMessageReceived,
		onConnectionClosed,
	});

    return {
        messages, 
        attachments, 
        isTyping, 
        isAwaitingAudio,
        onTranscriptionEnded,
    }
};

export default useChat;
