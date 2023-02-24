import { useSelector, shallowEqual } from "react-redux";

const ChatLog = () => {
	const messages = useSelector(
		(state: RootState) => state.chat.messages,
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
