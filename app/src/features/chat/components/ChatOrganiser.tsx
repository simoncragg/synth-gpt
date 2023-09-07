/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BsPlus } from "react-icons/bs";
import { TbLoader } from "react-icons/tb";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ChatLink from "./ChatLink";
import useAuth from "../../auth/hooks/useAuth";
import { newChatText } from "../../../constants";
import {
	useDeleteChatMutation,
	useEditChatTitleMutation,
	useGenerateTitleMutation,
	useLazyGetChatsQuery,
} from "../chatApi";
import { RootStateType } from "../../../store";

const ChatOrganiser = () => {
	
	const navigate = useNavigate();
	const { chatId, messages } = useSelector((state: RootStateType) => state.chat);
	const { userId, accessToken } = useAuth();
	const [getChats, { data: getChatsResponse, isFetching }] = useLazyGetChatsQuery();
	const [generateTitle, { data: genTitleResponse }] =	useGenerateTitleMutation();
	const [editChatTitle, { data: editChatTitleResponse }] = useEditChatTitleMutation();
	const [deleteChat, { data: deleteChatResponse }] = useDeleteChatMutation();

	useEffect(() => {
		if (userId && accessToken) {
			getChats({ userId, accessToken });
		}
	}, [userId, accessToken]);

	useEffect(() => {
		const chats = getChatsResponse?.chats ?? [];
		const currentChat = chats.find((chat) => chat.chatId === chatId);
		if (!currentChat && userId && accessToken) {
			getChats({ userId, accessToken });
		} else {
			updateTitleIfNeeded(currentChat);
		}
	}, [messages, userId, accessToken]);

	useEffect(() => {
		const chats = getChatsResponse?.chats ?? [];
		const currentChat = chats.find((chat) => chat.chatId === chatId);
		updateTitleIfNeeded(currentChat);
	}, [getChatsResponse]);

	useEffect(() => {
		if (genTitleResponse?.title && userId && accessToken) {
			getChats({ userId, accessToken });
		}
	}, [genTitleResponse, userId, accessToken]);

	useEffect(() => {
		if (editChatTitleResponse?.success && userId && accessToken) {
			getChats({ userId, accessToken });
		}
	}, [editChatTitleResponse, userId, accessToken]);

	useEffect(() => {
		if (deleteChatResponse?.success) {
			navigate("../", { replace: false });
		}
	}, [deleteChatResponse]);

	const updateTitleIfNeeded = (chat: Chat | undefined) => {
		if (chat?.title === newChatText) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.content.type === "text" && accessToken) {
				generateTitle({
					chatId,
					message: lastMessage.content.value as string,
					accessToken,
				});
			}
		}
	};

	return (
		<>
			<button
				type="button"
				className={`
					flex w-full py-3 px-2 items-center gap-2 rounded-md hover:bg-gray-700/50 
					text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20`
				} 	
				onClick={() => {
					navigate("../", { replace: messages.length === 0 });
				}}
			>
				<BsPlus className="w-6 h-6" />
				{newChatText}
			</button>

			{isFetching ? (
				<div className="flex justify-center items-center h-80">
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
									editChatTitle={(chatId, title) => {
										if (accessToken) {
											editChatTitle({ chatId, title, accessToken });
										}
									}}
									deleteChat={(chatId) => {
										if (accessToken) {
											deleteChat({ chatId, accessToken });
										}
									}}
								/>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
};

export default ChatOrganiser;
