import { useSelector, shallowEqual } from "react-redux";
import { RootStateType } from "../../../store";
import { AiOutlineUser } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import { RiVoiceprintFill } from "react-icons/ri";
import { mapToContentParts } from "../mappers/contentMapper";
import Code from "../../../components/Code";
import "./ChatLog.css";

const ChatLog = () => {
	const { messages, attachments } = useSelector(
		(state: RootStateType) => state.chat,
		shallowEqual
	);

	console.log(messages);

	return (
		<ol
			data-testid="chat-log"
			className="relative w-full border-l border-gray-700"
		>
			{messages.map(function ({ id, sender, timestamp, content }) {
				return (
					<li key={id} className="mb-10 ml-6 zoom-in">
						<span
							className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 -mt-1.5 ring-8 ring-gray-800 ${
								sender === "user" ? "bg-cyan-600" : "bg-fuchsia-600"
							}`}
						>
							{sender === "user" ? <AiOutlineUser /> : <RiVoiceprintFill />}
						</span>
						<time className="block mb-1 text-sm font-normal leading-none text-gray-500">
							{new Date(timestamp).toTimeString().substring(0, 8)}
						</time>

						{mapToContentParts(content).map((part) => {
							switch (part.type) {
								case "OrderedList":
									return (
										<ol data-testid="numberedPoints">
											{(part as OrderedList).listItems.map(
												(listItem: ListItem) => (
													<li
														key={listItem.id}
														className="mb-4 text-base font-normal text-gray-400"
													>
														{listItem.text}
													</li>
												)
											)}
										</ol>
									);

								case "CodeSnippet":
									return (
										<Code
											code={(part as CodeSnippet).code}
											language={(part as CodeSnippet).language}
										/>
									);

								default:
									return (
										<p className="mb-4 text-base font-normal text-gray-400">
											{(part as Paragraph).text}
										</p>
									);
							}
						})}
					</li>
				);
			})}
			{attachments
				.filter((x) => x.type === "Code")
				.map(({ id, content }) => (
					<li key={id} className="mb-10 ml-6">
						<span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 -mt-1.5 ring-8 ring-gray-800 bg-cyan-600">
							<ImAttachment />
						</span>
						<time className="block mb-1 text-sm font-normal leading-none text-gray-500">
							{new Date(Date.now()).toTimeString().substring(0, 8)}
						</time>
						<Code
							code={(content as CodeSnippet).code}
							language={(content as CodeSnippet).language}
						/>
					</li>
				))}
		</ol>
	);
};

export default ChatLog;
