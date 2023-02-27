import { useSelector, shallowEqual } from "react-redux";
import { RootStateType } from "../../store";

const ChatLog = () => {
	const messages = useSelector(
		(state: RootStateType) => state.chat.messages,
		shallowEqual
	);

	return (
		<div className={`${messages.length == 0 ? "hidden" : ""}`}>
			{messages.map((chatMessage) => (
				<div key={chatMessage.id}>{chatMessage.sender}: {chatMessage.message}</div>
			))}
		</div>
	);
};

export default ChatLog;
