import { useSelector } from "react-redux";
import { useSendMessageMutation } from "../../services/chatApi";
import { RootStateType } from "../../store";
import SpeechToText from "./SpeechToText";
import ChatLog from "./ChatLog";
import "./Chat.css";

const Chat = () => {

	const chatId = useSelector(
		(state: RootStateType) => state.chat.id
	);

	const [sendMessage] = useSendMessageMutation();

	const onSpeechRecognitionResult = (transcript: string) => {
		sendMessage({ chatId, message: transcript });
	};

	return (
		<div className="chat-container">
			<SpeechToText onResult ={onSpeechRecognitionResult} />
			<ChatLog />
		</div>
	);
};

export default Chat;

