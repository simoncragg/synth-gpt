import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsPlus } from "react-icons/bs";
import { TbLoader } from "react-icons/tb";
import { newChatText } from "../../../constants";
import {
	useDeleteChatMutation,
	useEditChatTitleMutation,
	useGenerateTitleMutation,
	useGetChatsQuery,
} from "../../../services/chatApi";
import { RootStateType } from "../../../store";
import useAuth from "../../auth/hooks/useAuth";
import ChatLink from "./ChatLink";

const ChatOrganiser = () => {
	const navigate = useNavigate();

	const { chatId, messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const { userId } = useAuth();

	const {
		refetch: refetchChats,
		data: getChatsResponse,
		isLoading,
	} = useGetChatsQuery(userId ?? "", {
		skip: !userId,
		refetchOnMountOrArgChange: true,
	});

	const [generateTitle, { data: genTitleResponse }] =
		useGenerateTitleMutation();

	const [editChatTitle, { data: editChatTitleResponse }] =
		useEditChatTitleMutation();

	const [deleteChat, { data: deleteChatResponse }] = useDeleteChatMutation();

	useEffect(() => {
		if (!userId) return;
		const chats = getChatsResponse?.chats ?? [];
		const currentChat = chats.find((chat) => chat.chatId === chatId);
		if (!currentChat) {
			refetchChats();
		} else {
			updateTitleIfNeeded(currentChat);
		}
	}, [userId, messages]);

	useEffect(() => {
		const chats = getChatsResponse?.chats ?? [];
		const currentChat = chats.find((chat) => chat.chatId === chatId);
		updateTitleIfNeeded(currentChat);
	}, [getChatsResponse]);

	useEffect(() => {
		if (genTitleResponse?.title) {
			refetchChats();
		}
	}, [genTitleResponse]);

	useEffect(() => {
		if (editChatTitleResponse?.success) {
			refetchChats();
		}
	}, [editChatTitleResponse]);

	useEffect(() => {
		if (deleteChatResponse?.success) {
			navigate("../", { replace: false });
		}
	}, [deleteChatResponse]);

	const updateTitleIfNeeded = (chat: Chat | undefined) => {
		if (chat?.title === newChatText) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.content.type === "text") {
				generateTitle({
					chatId,
					message: lastMessage.content.value as string,
				});
			}
		}
	};

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
						{(getChatsResponse?.chats ?? []).map((chat: Chat) => {
							return (
								<ChatLink
									key={`chat-link-${chat.chatId}`}
									chat={chat}
									isSelected={chat.chatId === chatId}
									editChatTitle={(chatId, title) =>
										editChatTitle({ chatId, title })
									}
									deleteChat={(chatId) => deleteChat({ chatId })}
								/>
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
