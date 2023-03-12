import { useSelector, shallowEqual } from "react-redux";
import { RootStateType } from "../../store";
import { AiOutlineUser } from "react-icons/ai";
import { RiVoiceprintFill } from "react-icons/ri";

const ChatLog = () => {
	const messages = useSelector(
		(state: RootStateType) => state.chat.messages,
		shallowEqual
	);

	return (
		<ol className="relative w-full border-l border-gray-200 dark:border-gray-700">
			{messages.map(({id, sender, timestamp, message}) => (
				<li key={id} className="mb-10 ml-6">            
					<span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 -mt-1.5 ring-8 ring-gray-900 ${sender === "user" ? "bg-cyan-900" : "bg-fuchsia-900"}`}>
						{sender === "user" ? (<AiOutlineUser />) : (<RiVoiceprintFill />)}
					</span>
					<time className="block mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{new Date(timestamp).toTimeString().substring(0,8)}</time>
					<p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{message}</p>
				</li>
			))}
		</ol>
	);
};

export default ChatLog;
