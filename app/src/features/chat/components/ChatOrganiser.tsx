import { useGetChatsQuery } from "../../../services/chatApi";
import { BsPlus, BsChatLeft } from "react-icons/bs";
import { TbLoader } from "react-icons/tb";

const ChatOrganiser = () => {
	const { data: chats = [], isLoading } = useGetChatsQuery();

	return (
		<>
			<button
				type="button"
				className="flex w-full py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-700 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
			>
				<BsPlus className="w-6 h-6" />
				New chat
			</button>

			{isLoading ? (
				<div
					data-testid="chat-org-spinner"
					className="flex justify-center items-center h-[75%]"
				>
					<TbLoader className="animate-spin text-center m-auto" />
				</div>
			) : (
				<div className="flex-col flex-1 overflow-y-auto">
					<div className="flex flex-col gap-2 text-gray-100 text-sm">
						{chats.map((chat: Chat) => {
							return (
								<a
									key={`chat-${chat.chatId}`}
									className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-gray-700 cursor-pointer break-all hover:pr-4"
								>
									<BsChatLeft className="w-4 h-4" />
									<div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
										{chat.title}
									</div>
								</a>
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
