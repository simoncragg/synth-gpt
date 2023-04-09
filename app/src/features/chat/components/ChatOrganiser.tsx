import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsPlus, BsChatLeft } from "react-icons/bs";
import { Link } from "react-router-dom";
import { TbLoader } from "react-icons/tb";
import { newChatText } from "../../../constants";
import { useGetChatsQuery } from "../../../services/chatApi";
import { RootStateType } from "../../../store";

const ChatOrganiser = () => {
	const navigate = useNavigate();

	const { chatId, messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const { refetch, data: chats = [], isLoading } = useGetChatsQuery();

	useEffect(() => {
		const currentChat = chats.find((chat) => chat.chatId === chatId);
		if (!currentChat) {
			refetch();
		}
	}, [messages]);

	return (
		<>
			<button
				type="button"
				className="flex w-full py-3 px-2 items-center gap-2 rounded-md hover:bg-gray-700 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
				onClick={() => {
					navigate("../", { replace: messages.length === 0 });
				}}
			>
				<BsPlus className="w-6 h-6" />
				{newChatText}
			</button>

			{isLoading ? (
				<div className="flex justify-center items-center h-[75%]">
					<TbLoader
						data-testid="chat-org-spinner"
						className="animate-spin text-center m-auto"
					/>
				</div>
			) : (
				<div className="flex-col flex-1 overflow-y-auto">
					<div className="flex flex-col gap-2 text-gray-100 text-sm">
						{chats.map((chat: Chat) => {
							return (
								<Link
									key={chat.chatId}
									to={`/chat/${chat.chatId}`}
									className={`flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all hover:pr-4${
										chat.chatId === chatId
											? " bg-gray-700"
											: " hover:bg-gray-700/50"
									}`}
								>
									<BsChatLeft className="w-4 h-4" />
									<div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
										{chat.title}
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			)}
			<div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-grey-800"></div>
		</>
	);
};

export default ChatOrganiser;
