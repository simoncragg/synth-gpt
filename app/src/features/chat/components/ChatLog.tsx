import { marked } from "marked";
import { useSelector, shallowEqual } from "react-redux";
import { AiOutlineUser } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import { RiVoiceprintFill } from "react-icons/ri";
import { RootStateType } from "../../../store";
import { mapToContentParts } from "../mappers/contentMapper";
import Code from "../../../components/Code";
import WebActivity from "./WebActivity";
import "./ChatLog.css";

const ChatLog = () => {
	const { messages, attachments } = useSelector(
		(state: RootStateType) => state.chat,
		shallowEqual
	);

	return (
		<ol
			data-testid="chat-log"
			className="w-full relative border-l border-gray-700"
		>
			{messages.map(({ id, role, timestamp, content }) => (
				<li key={id} className="mb-10 ml-6 zoom-in">
					<span
						className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 -mt-1 ring-8 ring-gray-800 ${
							role === "user" ? "bg-cyan-600" : "bg-fuchsia-600"
						}`}
					>
						{role === "user" ? <AiOutlineUser /> : <RiVoiceprintFill />}
					</span>

					<time className="block mb-1 text-sm font-normal leading-none text-gray-500">
						{new Date(timestamp).toTimeString().substring(0, 8)}
					</time>

					{content.type === "text" &&
						mapToContentParts(content.value as string).map(
							(part, partIndex) => {
								switch (part.type) {
									case "OrderedList":
										return (
											<ol
												key={`${id}-${partIndex}`}
												data-testid="numberedPoints"
											>
												{(part as OrderedList).listItems.map(
													(listItem: ListItem) => (
														<li
															key={`${id}-${partIndex}-${listItem.id}`}
															className="mb-4 text-base font-normal text-gray-400"
															dangerouslySetInnerHTML={{
																__html: marked.parseInline(listItem.text),
															}}
														/>
													)
												)}
											</ol>
										);

									case "CodeSnippet":
										return (
											<Code
												key={`${id}-${partIndex}`}
												code={(part as CodeSnippet).code}
												language={(part as CodeSnippet).language}
											/>
										);

									default:
										return (
											<p
												key={`${id}-${partIndex}`}
												className="mb-4 text-base font-normal text-gray-400"
												dangerouslySetInnerHTML={{
													__html: marked.parseInline((part as Paragraph).text),
												}}
											/>
										);
								}
							}
						)}

					{content.type === "webActivity" && (
						<WebActivity id={id} activity={content.value as WebActivity} />
					)}
				</li>
			))}
			{attachments
				.filter((x) => x.type === "Code")
				.map(({ id, content }, index) => (
					<li key={`${id}-${index}`} className="mb-10 ml-6">
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
